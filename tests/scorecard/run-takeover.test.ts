import { mkdirSync, writeFileSync } from 'node:fs';
import { describe, it } from 'vitest';
import { CACHE, SEEDS } from './plan';
import { takeover, TAKEOVERS } from './takeover';

describe.skipIf(!process.env.SCORECARD)('scorecard soft-lock takeover', () => {
  it('a builder takes over mid-game states and still progresses', () => {
    mkdirSync(CACHE, { recursive: true });
    const rows = SEEDS.slice(0, 5).flatMap((seed) => TAKEOVERS.map(([from, at]) => takeover(seed, from, at)));
    writeFileSync(`${CACHE}/takeover.json`, JSON.stringify(rows));
  }, 1_800_000);
});
