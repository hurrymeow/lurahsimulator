import { afterAll, describe, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { runBot } from './driver';
import { buildScorecard } from './scorecard';

// Local measure for T1: the options scorecard item 18 flags on the shipped events.
// MEASURE=1 npx vitest run tests/scorecard/measure-T1
const out: string[] = [];
describe.skipIf(!process.env.MEASURE)('measure item 18', () => {
  it('lists the options item 18 flags', () => {
    const row = buildScorecard({ builder: [runBot('builder', 1, 20)] }, [], '', []).find((r) => r.n === 18)!;
    out.push(`verdict: ${row.verdict}`, row.evidence);
  }, 120_000);
});
afterAll(() => {
  if (out.length) writeFileSync('/tmp/measure-T1.txt', `${out.join('\n')}\n`);
});
