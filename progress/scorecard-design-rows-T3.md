# T3: item 8 counts the step strip as a short goal — shipped

`driver.ts` logs a `step` event when `nextStep` changes kind or text (tick 0 only sets the baseline), and item 8 counts those events as short goals with the same 2 min window as a met checklist line. The harness test shows a timeline of only `step` events every 90 s has a short goal on 100% of counted ticks; typecheck and `npx vitest run tests/scorecard/harness.test.ts` pass (13 tests).

Builder seeds 1 to 3, short-horizon share (600 ticks, stop at 9 stars):

| Seed | Before | After |
| --- | --- | --- |
| 1 | 44% | 70% |
| 2 | 46% | 77% |
| 3 | 44% | 68% |
