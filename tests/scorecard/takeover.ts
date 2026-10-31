// Soft-lock check (TESTING.md item 6): a builder bot takes over a game mid-state and must still reach the next goal.
import { runBot, totalStars, type BotId } from './driver';
import type { Takeover } from './scorecard';

/** Plays `from` for `atTick`, then hands the state to the builder for `window` ticks. */
export function takeover(seed: number, from: BotId, atTick: number, window = 150): Takeover {
  const out: { s?: import('../../src/sim/types').GameState } = {};
  runBot(from, seed, atTick, { out });
  const s = out.s!;
  const stars = totalStars(s);
  const tl = runBot('builder', seed, window, { from: s });
  const progressed = tl.events.some((e) => e.kind === 'star' || e.kind === 'goal' || e.kind === 'promote');
  return {
    seed, from, atTick, gained: progressed,
    detail: progressed ? `${tl.events.filter((e) => e.kind === 'star').length} stars, ${tl.events.filter((e) => e.kind === 'goal').length} goal lines (had ${stars} stars)` : `no star or goal in ${window} ticks (had ${stars} stars)`,
  };
}

export const TAKEOVERS: [BotId, number][] = [['idle', 120], ['random', 100], ['cheapskate', 100]];
