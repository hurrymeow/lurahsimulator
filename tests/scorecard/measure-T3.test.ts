import { describe, it } from 'vitest';
import { runBot } from './driver';
import { buildScorecard } from './scorecard';

// Local measure for T3: item 8's short-horizon share for builder seeds 1 to 3.
// MEASURE=1 npx vitest run tests/scorecard/measure-T3
describe.skipIf(!process.env.MEASURE)('measure item 8 short horizon', () => {
  it('prints the short-horizon share', () => {
    const seeds = (process.env.SEEDS ?? '1,2,3').split(',').map(Number);
    for (const seed of seeds) {
      const tl = runBot('builder', seed, Number(process.env.TICKS ?? 600), { stopStars: 9 });
      const row = buildScorecard({ builder: [tl] }, [], '', []).find((r) => r.n === 8)!;
      const pct = /within 2 min on (\d+)%/.exec(row.evidence)?.[1] ?? '?';
      process.stdout.write(`MEASURE seed ${seed} short ${pct}%\n`);
    }
  }, 3_000_000);
});
