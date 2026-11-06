import { COMBOS } from '../data/combos';
import { bName, cName, t } from '../i18n';
import { STEMPEL } from './balance';
import { def } from './content';
import { parseNeed, ruleCanHold } from './combos';
import { RW_COMBOS } from '../data/higher/rw';
import { gateOpen } from './gate';
import { requirementGaps } from './rules';
import { attractTarget, buildCost, count, housing, population } from './state';
import { placeableDefs } from './content';
import { canPromote, nextStarChecklist, starChecklist } from './stages';
import { viewOf } from './neighbourView';
import { openRoles, queueMonths, staffSlots } from './staff';
import { ROLE_FX } from '../data/staff';
import type { GameState } from './types';

/** Game month when the first combo is pointed out by name: about 1.6 minutes at 1x (8s a week), so a player who has not found one still earns 1★ within 2 minutes. */
export const COMBO_HINT_MONTH = 12;

/** The cheapest combo the player could set up now, by the money still to spend on pieces they lack. */
export function easiestCombo(s: GameState) {
  let best: { name: string; pieces: string; ids: string[]; cost: number } | null = null;
  for (const c of COMBOS) {
    if (c.retired || s.discovered.includes(c.id)) continue;
    const defs = c.needs.map((n) => def(parseNeed(n).id));
    if (defs.some((d) => !d.placeable || requirementGaps(s, d, { ignoreLimit: true }).length)) continue;
    const cost = defs.reduce((sum, d) => sum + (count(s, d.id) ? 0 : d.cost), 0);
    if (!best || cost < best.cost) best = { name: cName(c), pieces: defs.map(bName).join(', '), ids: defs.map((d) => d.id), cost };
  }
  return best;
}

/**
 * The RW combo the player could set up for the least money, for an open RW combo goal. A piece that waits only on
 * another building (Posyandu needs a working Balai RW) still counts, and that building is named first.
 */
function easiestRwCombo(s: GameState) {
  let best: { name: string; pieces: string; first: string; cost: number } | null = null;
  for (const c of RW_COMBOS) {
    if (s.discovered.includes(c.id) || !gateOpen(s, c.gate) || !ruleCanHold(s, c)) continue;
    const defs = c.needs.map((id) => def(id));
    const first = new Set<string>();
    let reachable = true;
    for (const d of defs) {
      const need = (d.requires?.buildings ?? []).filter((id) => count(s, id, true) === 0);
      if (!d.placeable || requirementGaps(s, d, { ignoreLimit: true }).length !== need.length) reachable = false;
      for (const id of need) first.add(id);
    }
    for (const id of first) if (requirementGaps(s, def(id), { ignoreLimit: true }).length) reachable = false;
    if (!reachable) continue;
    const cost = [...defs, ...[...first].map((id) => def(id))].reduce((sum, d) => sum + (count(s, d.id, true) ? 0 : d.cost), 0);
    if (!best || cost < best.cost) best = { name: cName(c), pieces: defs.map(bName).join(', '), first: [...first].map((id) => bName(def(id))).join(', '), cost };
  }
  return best;
}

/**
 * For an open "Kampung Sebelah at N★" goal: its first unmet RT goal. Its residents follow its share of beds, so short
 * of residents means build Rumah there. The ranking goals are the player's own and never block it.
 */
function sebelahStep(s: GameState): { kind: StepKind; text: string } | null {
  if (!(nextStarChecklist(s) ?? []).some((l) => !l.done && l.goal.kind === 'sebelahAtStars')) return null;
  const n = s.neighbours.find((x) => x.cx === 1 && x.cy === 0 && x.run === 'player');
  if (!n) return null;
  const line = (starChecklist(viewOf(s, n), 'rt', n.stars as 0 | 1 | 2) ?? []).find((l) => !l.done && l.goal.kind !== 'rankWins' && l.goal.kind !== 'winStreak');
  if (!line) return null;
  return { kind: 'sebelah', text: line.goal.kind === 'residents' ? t('goal.short.sebelahHouses') : t('goal.short.sebelahNeed', { need: line.short }) };
}

/** The building that draws the most residents for its price, among those the player can build now. */
function bestDraw(s: GameState): string | null {
  const open = placeableDefs().filter((d) => d.attract > 0 && !d.housing && count(s, d.id) === 0 && requirementGaps(s, d, { ignoreLimit: true }).length === 0);
  const best = open.sort((a, b) => b.attract / buildCost(s, b) - a.attract / buildCost(s, a))[0];
  return best ? bName(best) : null;
}

/** True when the next star waits on a combo and every other goal on its list is already met. */
function starWaitsOnCombo(s: GameState): boolean {
  const open = nextStarChecklist(s)?.filter((l) => !l.done) ?? [];
  return open.length > 0 && open.every((l) => l.goal.kind === 'combos');
}

/** True when the next star still lists a combos goal that is not met. */
function comboGoalOpen(s: GameState): boolean {
  return (nextStarChecklist(s) ?? []).some((l) => !l.done && l.goal.kind === 'combos');
}

export type StepKind = 'house' | 'combo' | 'desk' | 'wait' | 'beds' | 'draw' | 'stempel' | 'sk' | 'sebelah' | 'rwCombo';

/** True when the player can post a lowongan for an Asisten right now: the role is open, a slot is free, none is posted. */
const canPostDesk = (s: GameState): boolean =>
  openRoles(s).some((r) => r.id === 'asisten') && (s.staff?.length ?? 1) < staffSlots(s) && !s.lowongan;

/**
 * One next action, only when it helps beyond the star list: the first house, the first combo once it is time
 * (or as soon as it is all the star still needs, ahead of beds), waiting on a build, beds, or what draws people
 * when residents stop coming. "Reach N residents" is not a step: the star list already says it with have and need.
 */
export function nextStep(s: GameState): { kind: StepKind; text: string; detail?: string } | null {
  if (!s.buildings.some((b) => b.def === 'rumah')) return { kind: 'house', text: t('goal.short.house') };
  // Every star is earned and the promotion waits in Menu: that is the one thing that moves the game on.
  if (s.stage.sk === 'offered' && canPromote(s)) return { kind: 'sk', text: t('goal.short.sk') };
  // Past the RT, a star that waits only on Stempel gets the Stempel step: say nothing else while it does.
  if (s.stage.current !== 'rt') {
    const open = nextStarChecklist(s)?.filter((l) => !l.done) ?? [];
    if (open.length > 0 && open.every((l) => l.goal.kind === 'stempelClear')) {
      return s.stempel.backlog >= STEMPEL.clearUnder - 1 ? { kind: 'stempel', text: t('goal.short.stempel') } : null;
    }
  }
  // An open RW combo goal names the cheapest RW combo, as the RT one does, rather than fall through to beds.
  if ((nextStarChecklist(s) ?? []).some((l) => !l.done && l.goal.kind === 'rwCombos')) {
    const c = easiestRwCombo(s);
    if (c) return { kind: 'rwCombo', text: t('goal.short.combo', { name: c.name }), detail: c.first ? t('goal.comboFirst', { first: c.first, pieces: c.pieces }) : t('goal.comboPieces', { pieces: c.pieces }) };
  }
  if ((s.month >= COMBO_HINT_MONTH && (s.discovered.length === 0 || comboGoalOpen(s))) || starWaitsOnCombo(s)) {
    const c = easiestCombo(s);
    // The pill names the combo; its buildings wait in the opened list, so the pill stays within two lines.
    if (c) return { kind: 'combo', text: t('goal.short.combo', { name: c.name }), detail: t('goal.comboPieces', { pieces: c.pieces }) };
  }
  const seb = sebelahStep(s);
  if (seb) return seb;
  // The permit queue is a staffing problem: say so once it is deep, while there is room to hire.
  const months = queueMonths(s);
  if (months >= ROLE_FX.asisten.hireAfter && canPostDesk(s)) return { kind: 'desk', text: t('goal.short.desk', { n: months }) };
  const pending = s.buildings.filter((b) => b.status === 'permit' || b.status === 'building').sort((a, b) => a.timer - b.timer)[0];
  if (pending) return { kind: 'wait', text: t('goal.short.wait', { name: bName(def(pending.def)) }) };
  const pop = population(s);
  if (pop >= housing(s)) return { kind: 'beds', text: t('goal.short.beds') };
  // Beds are free but nobody comes: the kampung has no more pull. Say what draws people, not "reach N".
  if (pop >= attractTarget(s)) {
    const name = bestDraw(s);
    if (name) return { kind: 'draw', text: t('goal.short.draw', { name }) };
  }
  return null;
}

/** The next step's text, or null. */
export const shortGoal = (s: GameState): string | null => nextStep(s)?.text ?? null;
