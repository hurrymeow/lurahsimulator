// What `npm run scorecard` runs: which bots, how many seeds, how long.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
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

/** `chunk` plays only some seeds and writes `<bot>-<first seed>.json`, so a nightly job can take one bot and a few seeds. */
export function runAndCache(bots: BotId[], seeds: number[] = SEEDS): void {
  mkdirSync(CACHE, { recursive: true });
  const file = (bot: BotId) => (seeds.length === SEEDS.length ? `${CACHE}/${bot}.json` : `${CACHE}/${bot}-${seeds[0]}.json`);
  for (const bot of bots) {
    const tls = seeds.map((seed) => runBot(bot, seed, MAX_TICKS, { stopStars: ALL_STARS }));
    writeFileSync(file(bot), JSON.stringify(tls));
  }
}

/** The timelines of a bot: one full file, or the seed chunks the nightly jobs wrote, in seed order. */
export const readCache = (bot: BotId): Timeline[] | undefined => {
  try {
    const files = existsSync(CACHE) ? readdirSync(CACHE).filter((f) => f === `${bot}.json` || (f.startsWith(`${bot}-`) && f.endsWith('.json'))) : [];
    if (!files.length) return undefined;
    return files.flatMap((f) => JSON.parse(readFileSync(`${CACHE}/${f}`, 'utf8')) as Timeline[]).sort((a, b) => a.seed - b.seed);
  } catch {
    return undefined;
  }
};
