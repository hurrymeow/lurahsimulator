import { mkdirSync, writeFileSync } from 'node:fs';
import { afterEach, describe, it } from 'vitest';
import { setGrid } from '../../src/sim/types';
import { playKecHint } from '../kec-bot-lib';
import { CACHE } from './plan';

afterEach(() => setGrid('rt'));

// The Kecamatan rows of the playtest (docs/plans/first-2h-playtest.md T1): the hint bot plays a new game to Kelurahan 3 stars,
// then the Kecamatan bot takes over. One job per seed pair in the Nightly workflow. SCORECARD=1 SEEDS=1,2 npx vitest run tests/scorecard/run-kec
const seeds = (process.env.SEEDS ?? '1').split(',').map(Number).filter(Boolean);
describe.skipIf(!process.env.SCORECARD)('Kecamatan rows, hint path', () => {
  it.each(seeds)('seed %i', (seed) => {
    mkdirSync(CACHE, { recursive: true });
    writeFileSync(`${CACHE}/kec-${seed}.json`, JSON.stringify(playKecHint(seed)));
  }, 3_000_000);
});
