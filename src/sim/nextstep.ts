import { COMBOS } from '../data/combos';
import { bName, cName, t } from '../i18n';
import { def } from './content';
import { parseNeed } from './combos';
import { requirementGaps } from './rules';
import { attractTarget, buildCost, count, housing, population } from './state';
import { placeableDefs } from './content';
import { nextStarChecklist } from './stages';
import type { GameState } from './types';

/** Game month when the first combo is pointed out by name: about 4 minutes at 1x (8s a month). */
export const COMBO_HINT_MONTH = 30;

/** The cheapest combo the player could set up now, by the money still to spend on pieces they lack. */
export function easiestCombo(s: GameState) {
  let best: { name: string; pieces: string; ids: string[]; cost: number } | null = null;
  for (const c of COMBOS) {
    const defs = c.needs.map((n) => def(parseNeed(n).id));
    if (defs.some((d) => !d.placeable || requirementGaps(s, d, { ignoreLimit: true }).length)) continue;
    const cost = defs.reduce((sum, d) => sum + (count(s, d.id) ? 0 : d.cost), 0);
    if (!best || cost < best.cost) best = { name: cName(c), pieces: defs.map(bName).join(', '), ids: defs.map((d) => d.id), cost };
  }
  return best;
}

/** The building that draws the most residents for its price, among those the player can build now. */
function bestDraw(s: GameState): string | null {
  const open = placeableDefs().filter((d) => d.attract > 0 && !d.housing && requirementGaps(s, d, { ignoreLimit: true }).length === 0);
  const best = open.sort((a, b) => b.attract / buildCost(s, b) - a.attract / buildCost(s, a))[0];
  return best ? bName(best) : null;
}

/** True when the next star waits on a combo and every other goal on its list is already met. */
function starWaitsOnCombo(s: GameState): boolean {
  const open = nextStarChecklist(s)?.filter((l) => !l.done) ?? [];
  return open.length > 0 && open.every((l) => l.goal.kind === 'combos');
}

export type StepKind = 'house' | 'combo' | 'wait' | 'beds' | 'draw';

/**
 * One next action, only when it helps beyond the star list: the first house, the first combo once it is time
 * (or as soon as it is all the star still needs, ahead of beds), waiting on a build, beds, or what draws people
 * when residents stop coming. "Reach N residents" is not a step: the star list already says it with have and need.
 */
export function nextStep(s: GameState): { kind: StepKind; text: string } | null {
  if (!s.buildings.some((b) => b.def === 'rumah')) return { kind: 'house', text: t('goal.short.house') };
  if ((s.month >= COMBO_HINT_MONTH && s.discovered.length === 0) || starWaitsOnCombo(s)) {
    const c = easiestCombo(s);
    if (c) return { kind: 'combo', text: t('goal.short.combo', { name: c.name, pieces: c.pieces }) };
  }
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
