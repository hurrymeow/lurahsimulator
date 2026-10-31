// What `npm run scorecard` runs: which bots, how many seeds, how long.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { runBot, type BotId, type Timeline } from './driver';

export const SEEDS = Array.from({ length: 10 }, (_, i) => i + 1);
/** 450 ticks is 60 min at 1x, longer than the content lasts for any bot that plays well. */
export const MAX_TICKS = 450;
/** The nine stars across RT, RW and Kelurahan. A run stops when a bot has them all. */
export const ALL_STARS = 9;
export const CACHE = 'scorecard/.cache';

/** Bots are split so vitest runs them on separate workers. */
export const GROUPS: BotId[][] = [
  ['builder', 'idle', 'hint'],
  ['shopkeeper', 'safety', 'random'],
  ['cheapskate', 'pencitraan', 'honest'],
];

export function runAndCache(bots: BotId[]): void {
  mkdirSync(CACHE, { recursive: true });
  for (const bot of bots) {
    const tls = SEEDS.map((seed) => runBot(bot, seed, MAX_TICKS, { stopStars: ALL_STARS }));
    writeFileSync(`${CACHE}/${bot}.json`, JSON.stringify(tls));
  }
}

export const readCache = (bot: BotId): Timeline[] | undefined => {
  try {
    return JSON.parse(readFileSync(`${CACHE}/${bot}.json`, 'utf8'));
  } catch {
    return undefined;
  }
};
