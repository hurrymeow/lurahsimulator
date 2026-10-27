import { COMBOS } from '../data/combos';
import { bName, cName, t } from '../i18n';
import { def } from './content';
import { requirementGaps } from './rules';
import { count, housing, population } from './state';
import type { GameState } from './types';

/** Game month when the first combo is pointed out by name: about 4 minutes at 1x (8s a month). */
export const COMBO_HINT_MONTH = 30;

/** The cheapest combo the player could set up now, by the money still to spend on pieces they lack. */
function easiestCombo(s: GameState) {
  let best: { name: string; pieces: string; cost: number } | null = null;
  for (const c of COMBOS) {
    const defs = c.needs.map(def);
    if (defs.some((d) => !d.placeable || requirementGaps(s, d, { ignoreLimit: true }).length)) continue;
    const cost = defs.reduce((sum, d) => sum + (count(s, d.id) ? 0 : d.cost), 0);
    if (!best || cost < best.cost) best = { name: cName(c), pieces: defs.map(bName).join(', '), cost };
  }
  return best;
}

/**
 * The goal for the next minute or less, so there is always a quick thing to do. The star goal is the long one.
 * Order: first house, then the first combo once it is time, then waiting on a build, beds, and residents.
 */
export function shortGoal(s: GameState): string | null {
  if (!s.buildings.some((b) => b.def === 'rumah')) return t('goal.short.house');
  if (s.month >= COMBO_HINT_MONTH && s.discovered.length === 0) {
    const c = easiestCombo(s);
    if (c) return t('goal.short.combo', { name: c.name, pieces: c.pieces });
  }
  const pending = s.buildings.filter((b) => b.status === 'permit' || b.status === 'building').sort((a, b) => a.timer - b.timer)[0];
  if (pending) return t('goal.short.wait', { name: bName(def(pending.def)) });
  const pop = population(s);
  if (pop >= housing(s)) return t('goal.short.beds');
  return t('goal.short.pop', { n: (Math.floor(pop / 3) + 1) * 3 });
}
