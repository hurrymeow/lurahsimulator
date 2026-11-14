# Scorecard design rows T5: RW prices step up with RW income

Plan: `docs/plans/scorecard-design-rows.md` T5. The executor run ended before it wrote this file; the reviewer measured the numbers below.

- Every building cost in `src/data/higher/rw.ts` doubles (factor 2): Rp 6M to 12M, 5M to 10M, 3.5M to 7M, 4.5M to 9M, 3M to 6M.
- Item 15 ratio, income over median star-unlock cost, builder seeds 1 to 3 at 700 ticks:

| | RT | RW | Kel | RT to RW growth | RW to Kel growth |
| --- | --- | --- | --- | --- | --- |
| Before | 0.56 | 4.61 | 5.01 | 8.2x | 1.09x |
| After | 0.56 | 2.33 | 5.19 | 4.1x | 2.23x |

- Builder RW star minutes (seeds 1, 2, 3):

| Star | Before | After |
| --- | --- | --- |
| RW 1★ | 10.9, 11.7, 11.1 | 10.9, 11.7, 11.1 |
| RW 2★ | 22.4, 21.3, 21.6 | 23.7, 23.2, 23.2 |
| RW 3★ | 28.8, 25.6, 27.2 | 28.8, 25.6, 27.2 |
