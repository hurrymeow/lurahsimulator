import { describe, it } from 'vitest';
import { runBot } from './driver';
import { buildScorecard } from './scorecard';

// Local measure for T6: item 15's dearest-key seconds and the per-stage growth ratio.
// MEASURE=1 npx vitest run tests/scorecard/measure-T6
describe.skipIf(!process.env.MEASURE)('measure item 15', () => {
  it('prints the dearest-key seconds and growth ratios', () => {
    const seeds = (process.env.SEEDS ?? '1').split(',').map(Number);
    const runs = seeds.map((seed) => runBot('builder', seed, Number(process.env.TICKS ?? 600), { stopStars: 9 }));
    const row = buildScorecard({ builder: runs }, [], '', []).find((r) => r.n === 15)!;
    process.stdout.write(`MEASURE item 15 ${row.verdict}: ${row.evidence}\n`);
  }, 3_000_000);
});
