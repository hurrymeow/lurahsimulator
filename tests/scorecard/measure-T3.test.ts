import { describe, it } from 'vitest';
import { runBot, SECONDS_PER_TICK } from './driver';
import { takeover } from './takeover';

// Local measure for T3: takeover results and builder star minutes.
// MEASURE=1 npx vitest run tests/scorecard/measure-T3
describe.skipIf(!process.env.MEASURE)('measure T3 off-road rebuild', () => {
  it('prints takeover results and builder star minutes', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const t = takeover(seed, 'random', 100);
      process.stdout.write(`TAKEOVER ${seed} random@100 ${t.gained ? 'gained' : 'stuck'}: ${t.detail}\n`);
    }
    for (const seed of [1, 2, 3]) {
      const tl = runBot('builder', seed, 700);
      const m = (t?: number) => (t === undefined ? 'never' : ((t * SECONDS_PER_TICK) / 60).toFixed(1));
      process.stdout.write(`MEASURE builder ${seed} stars 1..6 ${[0, 1, 2, 3, 4, 5].map((i) => m(tl.starTicks[i])).join('/')}\n`);
    }
  }, 3_000_000);
});
