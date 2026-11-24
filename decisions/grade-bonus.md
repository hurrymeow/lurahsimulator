# GRADE_BONUS: kept as it is

TODO idea "Tune `GRADE_BONUS`" (from `decisions/41-half-year-report-night-tint.md`): the economy might feel thin after the report card went half-yearly.

## Verdict
Keep `GRADE_BONUS` unchanged (S: Popularitas +5 and Orang Inside +1; A: Popularitas +3; B: Popularitas +1; C and D: nothing).

## Why
- **The premise no longer holds.** The bonus pays no Rupiah, only Popularitas and Orang Inside, so it cannot make money thin or rich. The report card now lands every 12 weeks (`QUARTER_MONTHS = 12`), not every half-year.
- **Money is not thin.** Scorecard on main at f00b048 (local run, 12 Pass, 12 Fail, 3 Unknown): row 15 reads a median of 38 s of income for the dearest key item (bar 30 to 120 s), but income outgrows costs 3.24x from RT to RW and 2.74x from RW to Kelurahan (bar 0.7 to 1.5). Row 14 fails only on a short dip to -Rp 0.3jt for the builder. If anything the economy snowballs.
- **The bonus does not move a star.** `tests/scorecard/measure-grade.test.ts` ran six bots on seeds 1 to 6 with the bonus off, as is, and doubled:
  - Over a run to Kelurahan 3★ the bonus adds Popularitas +40 to +59 (about 10% of all Popularitas gained) and Orang Inside +2 to +5, which fades at 5% a week (#465).
  - Builder, shopkeeper, honest and pencitraan reach RT 1★, RW 1★ and 2★, Kel 1★, 2★ and 3★ on the same minute at x0, x1 and x2 on 22 of 24 seeds. The other 2 move one star by at most 1.8 min (about one quarter), in no consistent direction: builder seed 5's Kel 1★ is 25.5, 25.9 and 24.1 min.
  - Doubling does not rescue a stalled cheapskate seed (seeds 2, 3 and 5 stall at every scale), and the idle bot, which never earns a star, gains the most from it (+100 Popularitas at x2). A bigger bonus would mostly pay for doing nothing, against GAME-DESIGN.md §8 item 4 (skill matters).
- **What it does well is feedback.** The report card is the beat where a good quarter is told and paid, and a small Popularitas nudge fits that. Grades spread S 2 to 5, A 3 to 9, B 13 to 20, C 1 to 5 per climbing run, so A and S stay worth aiming for.

## If it comes back
The lever for a thin or fat economy is income and costs (scorecard rows 14 and 15), not the grade bonus. Rerun the measure with `MEASURE_GRADE=1 BOTS=builder,honest SEEDS=1,2,3 npx vitest run tests/scorecard/measure-grade` after any change to report grades.
