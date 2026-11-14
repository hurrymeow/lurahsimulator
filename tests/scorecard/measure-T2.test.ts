import { describe, it } from 'vitest';
import { runBot } from './driver';
import { buildScorecard, starKindRows } from './scorecard';

// Local measure for T2: item 12 star kind counts and the row on builder seeds 1 to 3.
// MEASURE=1 npx vitest run tests/scorecard/measure-T2
describe.skipIf(!process.env.MEASURE)('measure item 12 star rewards', () => {
  it('prints each star kind count and the item 12 row', () => {
    for (const r of starKindRows()) process.stdout.write(`MEASURE ${r.stage} ${r.star + 1}star ${r.kinds.length} ${r.kinds.join(',')}\n`);
    const seeds = (process.env.SEEDS ?? '1,2,3').split(',').map(Number);
    const tls = seeds.map((seed) => runBot('builder', seed, Number(process.env.TICKS ?? 600), { stopStars: 9 }));
    const row = buildScorecard({ builder: tls }, [], '', []).find((r) => r.n === 12)!;
    process.stdout.write(`MEASURE row12 ${row.verdict} ${row.evidence}\n`);
  }, 3_000_000);
});
