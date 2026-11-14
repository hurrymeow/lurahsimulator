# T11: item 18 compares rolled options on average

`tests/scorecard/scorecard.ts` now includes choices with rolled outcomes in item 18: each is reduced to the probability-weighted mean of its `res` changes before the existing dominance loop, the dominated option is named in the evidence with its label, and the `Unknown` override is gone so the row reads Pass or Fail. Added a canary test in `harness.test.ts` that injects dominated and equal-mean events, and a MEASURE-gated `measure-T11.test.ts` that prints the row. `npm run typecheck` and `npm test` pass (698 passed, 11 skipped).
