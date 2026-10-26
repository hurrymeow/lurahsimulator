import { bName, cEffect, cName, cStory, t } from '../i18n';
import { COMBOS, type ComboDef } from '../data/combos';
import { STAGE_COMBOS, type StageComboDef } from '../data/higher';
import { def } from './content';
import { within } from './footprint';
import { gateOpen } from './gate';
import { gain, type Fx } from './gain';
import { isWorking } from './state';
import type { Building, GameState } from './types';

export interface ActiveCombo {
  combo: ComboDef;
  members: Building[];
}

/** Radius counts from the edge of each footprint, so a 2x2 shop is not penalised for its size. */
const near = within;

/** Combos that can fire now: the RT ones, plus later-stage ones whose gate is open. */
export const liveCombos = (s: GameState): ComboDef[] => [...COMBOS, ...STAGE_COMBOS.filter((c) => gateOpen(s, c.gate))];

/** Combos the Buku Combo lists: the RT ones, plus every combo of a stage the player has reached. */
export const bookCombos = (s: GameState): ComboDef[] => [...COMBOS, ...STAGE_COMBOS.filter((c) => gateOpen(s, { ...c.gate, stars: 0 }))];

/** Two AI RTs in the area share a trait. */
const sameTraitNeighbours = (s: GameState): boolean => s.neighbours.some((n, i) => s.neighbours.some((o, j) => j > i && o.trait === n.trait));

/** Finds every working combo. One instance per anchor building. */
export function activeCombos(s: GameState): ActiveCombo[] {
  const working = s.buildings.filter(isWorking);
  const out: ActiveCombo[] = [];
  for (const combo of liveCombos(s)) {
    const [anchorId, ...rest] = combo.needs;
    const rule = (combo as Partial<StageComboDef>).rule;
    for (const anchor of working.filter((b) => b.def === anchorId)) {
      if (rule === 'sameTraitNeighbours') {
        if (sameTraitNeighbours(s)) out.push({ combo, members: [anchor] });
        continue;
      }
      const members = [anchor];
      for (const id of rest) {
        const hit = working.find((b) => b.def === id && near(anchor, b, combo.radius) && !members.includes(b));
        if (!hit) break;
        members.push(hit);
      }
      if (members.length === combo.needs.length) out.push({ combo, members });
    }
  }
  return out;
}

/** Income multiplier a building gets from the combos it belongs to. */
export function comboIncomeMult(s: GameState, b: Building): number {
  let m = 1;
  for (const a of activeCombos(s)) if (a.members.includes(b)) m *= a.combo.incomeMult?.[b.def] ?? 1;
  return m;
}

/** Monthly system: applies combo effects and announces first discoveries. */
export function comboSystem(s: GameState, fx: Fx): void {
  for (const a of activeCombos(s)) {
    const centre = a.members[0];
    for (const [res, v] of Object.entries(a.combo.perMonth ?? {})) gain(s, fx, res as 'sabar', v as number, centre);
    if (s.discovered.includes(a.combo.id)) continue;
    s.discovered.push(a.combo.id);
    s.lastNovelty = s.month;
    for (const m of a.members) fx.push({ kind: 'built', uid: m.uid });
    fx.push({
      kind: 'notice',
      title: t('combo.notice', { name: cName(a.combo) }),
      body: t('combo.noticeBody', { story: cStory(a.combo), effect: cEffect(a.combo) }),
      tone: 'good',
      fanfare: true,
      x: centre.x,
      y: centre.y,
    });
  }
}

export const comboMemberNames = (c: ComboDef) => c.needs.map((id) => bName(def(id)));
