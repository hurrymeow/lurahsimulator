# Lomba every second year

Added `everyYears: 2` to `LOMBA` and gated the lomba announce on `year(s) % LOMBA.everyYears === 0`, so the big day now comes in `yearsDone` 0, 2, 4. Skipped years cost no Popularitas: no card forms, `lombaPrep` is null and the day step returns early on the year mismatch. Updated scorecard item 22's big-day gap and added a test covering month 67 (year 1, no lomba) and month 115 (year 2, announced).

Review (Sonnet): diff read in full, matches the plan. Typecheck and `tests/lomba.test.ts` (10 tests) pass. Known gap: `agustusan()` (July and August bunting on the map) still shows every year, so a skipped year has decorations with no lomba. Logged as a follow-up.
