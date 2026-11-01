import { writeFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { setGrid } from '../src/sim/types';
import { playKec } from './kec-bot-lib';

afterEach(() => setGrid('rt'));

/** Weeks at 1x: a week is 8s, so 45 min is 337 weeks and 70 min is 525 (docs/plans/kecamatan-slice.md, band B5). */
const MIN_WEEKS = 337;
const MAX_WEEKS = 525;

// One seed is about 10 minutes, so this runs in the nightly job, not in `npm test`. KEC_BOT=1 SEEDS=3,4 npx vitest run tests/kec-bot.test.ts
const seeds = (process.env.SEEDS ?? '3,4').split(',').map(Number).filter(Boolean);
describe.skipIf(!process.env.KEC_BOT)('Kecamatan bot', () => {
  it.each(seeds)('seed %i reaches 3 stars in 45 to 70 minutes at 1x with pinjol under 10%', (seed) => {
    const run = playKec(seed);
    writeFileSync(`/tmp/kec-bot-${seed}.json`, JSON.stringify(run));
    expect(run.promoted, JSON.stringify(run)).toBeDefined();
    expect(run.at.length, JSON.stringify(run)).toBe(3);
    expect(run.at[2], JSON.stringify(run)).toBeGreaterThanOrEqual(MIN_WEEKS);
    expect(run.at[2], JSON.stringify(run)).toBeLessThanOrEqual(MAX_WEEKS);
    expect(run.pinjol, JSON.stringify(run)).toBeLessThan(10);
  }, 3_000_000);
});
