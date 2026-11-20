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

/** Row 23's forced worst-event chain: the bad events a builder can meet, back to back, the week after a star. */
export const WORST_CHAIN = ['banjir', 'cabai', 'truckSampah', 'padam'];

export interface ChainRun {
  seed: number;
  /** The star the chain followed, as an index into the nine (0 = RT 1★, 3 = RW 1★). */
  after: number;
  /** Ticks from that star to the next one; undefined if it never came. */
  took?: number;
  /** 2x the star's target gap: GAME-DESIGN.md §8 row 23, "Worst chain: next star within 2x target". */
  limit: number;
}

/**
 * Plays the builder and, the week after star `after` lands, forces the chain one event a week. The builder answers each
 * with the free choice, the worst for Popularitas. Reports how long the next star then took.
 */
export function worstChain(seed: number, after: number, limit: number, ticks = 450): ChainRun {
  let at: number | undefined;
  let queue: string[] = [];
  const tl = runBot('builder', seed, ticks, { stopStars: after + 2, onTick: (s, t) => {
    if (at === undefined && totalStars(s) > after) { at = t; queue = [...WORST_CHAIN]; }
    if (queue.length && !s.pendingEvent) {
      const id = queue.shift()!;
      s.pendingEvent = id;
      (s.lastEvent ??= {})[id] = s.month;
    }
  } });
  const next = tl.starTicks[after + 1];
  return { seed, after, took: at !== undefined && next !== undefined ? next - at : undefined, limit };
}
