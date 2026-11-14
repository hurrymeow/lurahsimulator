import { describe, it } from 'vitest';
import { runBot } from './driver';
import { BANDS, topSpendByBand } from './scorecard';

// Local measure for T10: builder spend share per building kind per band. SEEDS=1,2,3 MEASURE=1 npx vitest run tests/scorecard/measure-T10
describe.skipIf(!process.env.MEASURE)('measure item 16 spend proxy', () => {
  it('prints the top spend kind per band', () => {
    const seeds = (process.env.SEEDS ?? '1,2,3').split(',').map(Number);
    const tls = seeds.map((seed) => runBot('builder', seed, Number(process.env.TICKS ?? 200)));
    for (const r of topSpendByBand(tls)) process.stdout.write(`MEASURE ${BANDS[r.band]} ${r.kind} ${(r.share * 100).toFixed(0)}% of ${(r.total / 1e6).toFixed(1)}M\n`);
  }, 3_000_000);
});
