# T6 progress

- `tests/scorecard/driver.ts`: added `Row.dearKey` and `dearKeyCost`, the dearest unowned non-decor, non-housing kind that passes the `nextKeyCost` filter, and filled it in the recorder. `nextKey` is unchanged.
- `tests/scorecard/scorecard.ts`: item 15 uses `dearKey` and adds the per-stage ratio of median `net` to the median cost of that stage's star unlocks, checking RT-to-RW and RW-to-Kelurahan growth within 0.7 to 1.5; the "is not measured" text is gone and the row is a full verdict.
- `tests/scorecard/harness.test.ts`: one test builds synthetic RT, RW and Kelurahan rows, asserts growth of 1.00x passes and a doubling of Kelurahan income fails.
- `tests/scorecard/measure-T6.test.ts`: scratch measure (prints item 15). Builder on seeds 1 to 3: median 27s, p95 109s, growth RT to RW 6.73x and RW to Kelurahan 1.11x, so the real row fails the ratio today.
- Checks: `npm run typecheck` passes, `npm test` passes (694 passed, 10 skipped), and the harness spec passes (7 tests). No e2e run needed.
