import { describe, it } from 'vitest';
import { runBot } from './driver';
import { buildScorecard } from './scorecard';

// Local measure for T11: which options item 18 reports as dominated. MEASURE=1 npx vitest run tests/scorecard/measure-T11
describe.skipIf(!process.env.MEASURE)('measure item 18', () => {
  it('prints the dominated options', () => {
    const row = buildScorecard({ builder: [runBot('builder', 1, 20)] }, [], '', []).find((r) => r.n === 18)!;
    process.stdout.write(`MEASURE item 18 ${row.verdict}: ${row.evidence}\n`);
  });
});
