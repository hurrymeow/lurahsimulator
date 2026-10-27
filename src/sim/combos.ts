import { bName, cEffect, cName, cStory, t } from '../i18n';
import { COMBOS, type ComboDef } from '../data/combos';
import { STAGE_COMBOS, type StageComboDef } from '../data/higher';
import { def } from './content';
import { jobDef } from '../data/jobs';
import { jName } from '../i18n';
import { gateOpen } from './gate';
import { gain, type Fx } from './gain';
import { isWorking } from './state';
import type { Building, GameState, JobId } from './types';

export interface ActiveCombo {
  combo: ComboDef;
  members: Building[];
}

const ORDER = ['rt', 'rw', 'kelurahan'];
const near = (a: Building, b: Building, r: number) => Math.abs(a.x - b.x) <= r && Math.abs(a.y - b.y) <= r;

/** Combos that can fire now: the RT ones, plus later-stage ones whose gate is open. */
export const liveCombos = (s: GameState): ComboDef[] => [...COMBOS, ...STAGE_COMBOS.filter((c) => gateOpen(s, c.gate))];

/** Combos the Buku Combo lists: the RT ones, plus every combo of a stage the player has reached. */
export const bookCombos = (s: GameState): ComboDef[] => [...COMBOS, ...STAGE_COMBOS.filter((c) => gateOpen(s, { ...c.gate, stars: 0 }))];

/** Two AI RTs in the area share a trait. */
const sameTraitNeighbours = (s: GameState): boolean => s.neighbours.some((n, i) => s.neighbours.some((o, j) => j > i && o.trait === n.trait));

/**
 * Finds every working combo. One instance per anchor building.
 * Income reads this once per building, so the answer is kept until the layout, the stage or the
 * neighbours change. The key is cheap to build compared with the search it saves.
 */
const cache = new WeakMap<GameState, { key: number; out: ActiveCombo[] }>();

/** A number that changes whenever a building moves, appears, or changes status, or the stage or neighbours change. */
function layoutKey(s: GameState): number {
  let h = ORDER.indexOf(s.stage.current) * 31 + s.stage.stars.rt * 7 + s.stage.stars.rw * 11 + s.stage.stars.kelurahan * 13 + (s.stage.path?.length ?? 0);
  for (const n of s.neighbours) h = (Math.imul(h, 31) + n.trait.charCodeAt(0)) | 0;
  for (const b of s.buildings) h = (Math.imul(h, 31) + b.uid * 977 + b.x * 61 + b.y * 17 + b.status.charCodeAt(0)) | 0;
  return h;
}

export function activeCombos(s: GameState): ActiveCombo[] {
  const key = layoutKey(s);
  const hit = cache.get(s);
  if (hit?.key === key) return hit.out;
  const out = findCombos(s);
  cache.set(s, { key, out });
  return out;
}

function findCombos(s: GameState): ActiveCombo[] {
  const working = s.buildings.filter(isWorking);
  const out: ActiveCombo[] = [];
  for (const combo of liveCombos(s)) {
    const [anchorId, ...rest] = combo.needs;
    const { rule, needsJob } = combo as Partial<StageComboDef>;
    if (needsJob && !s.residents.some((r) => r.job === needsJob)) continue;
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

export interface ComboStatus {
  /** active: working in town now. found: seen before but not working now. todo: never seen. */
  state: 'active' | 'found' | 'todo';
  /** Names of what is not in town yet: buildings that are not working, or the job. Empty when all are there. */
  missing: string[];
}

/** Where a combo stands in this town, for the Buku Combo and the star checklist. */
export function comboStatus(s: GameState, c: ComboDef): ComboStatus {
  if (activeCombos(s).some((a) => a.combo.id === c.id)) return { state: 'active', missing: [] };
  const working = s.buildings.filter(isWorking);
  const pool = [...working];
  const missing: string[] = [];
  for (const id of c.needs) {
    const i = pool.findIndex((b) => b.def === id);
    if (i >= 0) pool.splice(i, 1);
    else missing.push(bName(def(id)));
  }
  const job = (c as Partial<StageComboDef>).needsJob;
  if (job && !s.residents.some((r) => r.job === job)) {
    const jd = jobDef(job as JobId);
    missing.push(jd ? jName(jd) : job);
  }
  return { state: s.discovered.includes(c.id) ? 'found' : 'todo', missing };
}

/** One plain line: which buildings, how close, and any extra rule. */
export function comboConditions(c: ComboDef): string {
  const sc = c as Partial<StageComboDef>;
  const names = comboMemberNames(c).join(' + ');
  const r = c.radius >= 99 ? t('combo.anywhere') : c.radius > 1 ? t('combo.tileN', { n: c.radius }) : t('combo.tile1');
  const extra = [sc.rule === 'sameTraitNeighbours' ? t('combo.ruleTrait') : '', sc.needsJob ? t('combo.ruleJob', { job: jobDef(sc.needsJob as JobId) ? jName(jobDef(sc.needsJob as JobId)!) : sc.needsJob }) : ''].filter(Boolean).join(' ');
  return [t('combo.needs', { names, r }), extra].filter(Boolean).join(' ');
}

/** Status line, for example "Active in town" or "Not in town yet. Missing: Wifi". */
export function comboStatusText(st: ComboStatus): string {
  const base = t(`combo.state.${st.state}` as 'combo.state.active');
  return st.missing.length ? `${base}. ${t('combo.missing', { names: st.missing.join(', ') })}` : st.state === 'active' ? base : `${base}. ${t('combo.placeClose')}`;
}
