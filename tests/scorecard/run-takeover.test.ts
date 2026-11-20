import { mkdirSync, writeFileSync } from 'node:fs';
import { describe, it } from 'vitest';
import { CACHE, SEEDS } from './plan';
import { takeover, TAKEOVERS, worstChain } from './takeover';

describe.skipIf(!process.env.SCORECARD)('scorecard soft-lock takeover', () => {
  it('a builder takes over mid-game states and still progresses', () => {
    mkdirSync(CACHE, { recursive: true });
    const rows = SEEDS.slice(0, 5).flatMap((seed) => TAKEOVERS.map(([from, at]) => takeover(seed, from, at)));
    writeFileSync(`${CACHE}/takeover.json`, JSON.stringify(rows));
    // Row 23: the worst chain after RT 1★ (RT 2★ target 37 weeks from the start) and after RW 1★ (RW star gap 52).
    const chains = SEEDS.slice(0, 5).flatMap((seed) => [worstChain(seed, 0, 2 * 37), worstChain(seed, 3, 2 * 52)]);
    writeFileSync(`${CACHE}/chain.json`, JSON.stringify(chains));
  }, 1_800_000);
});
