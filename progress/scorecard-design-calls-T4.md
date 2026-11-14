# T4 progress

- `tests/scorecard/driver.ts`: added `Row.useful`, set from `usefulNow(s)`, a short-circuit over a new non-decor kind, a Rumah while beds are under residents plus five, an allowed upgrade, a repair, a permit skip, a neighbour visit, and the missing piece of `easiestCombo(s)`. `nextKey` unchanged.
- `tests/scorecard/scorecard.ts`: item 1 now counts `!r.useful && r.goalsDone < r.goalsTotal`, keeps the 60s bar, and the evidence names the action set.
- `tests/scorecard/harness.test.ts`: the row-value check also accepts booleans.
- `tests/scorecard/measure-T4.test.ts`: one counted stall (64s) and one run with a useful action each cycle (longest wait 8s).
- `npm run typecheck` and `npm test` pass (695 passed, 10 skipped).
