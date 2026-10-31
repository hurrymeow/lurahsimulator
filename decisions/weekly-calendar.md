# Weekly calendar, no 4x

Date: 2026-10-31. Decided by Hari: days are too fast for Indonesian life, weeks fit. 4x is removed.

## What changed
- One tick (`MONTH_MS`, 8s at 1x) is one week. A month is 4 weeks (32s), a year 48 weeks (6.4 min).
- Speeds are pause, 1x, 2x. `FAST_FROM_YEAR` and the 4x picture are gone.
- `src/sim/calendar.ts` holds the calendar. `GameState.month` still counts ticks, so it now means weeks. The name stays so saves load unchanged.
- HUD date reads `Mar W2 · Y3` (ID: `Mar M2 · T3`).

## Re-basing rule
- Anything counted in ticks keeps its number, so wall time is unchanged: cooldowns, `minMonth`, building income and upkeep, modifier lengths, Act 1 length, RT 3★ target. Their text now says weeks.
- Anything written per year was tuned for a 12-tick year. It now fires every 48 ticks, so rates scale by `YEAR_SCALE` (4) to pay out the same per second: inflation (3% became 12.55%), Emas per year, Kelurahan budget, Panen Raya bonus, Kader Apresiasi and decay.
- Calendar-month events (`months: [..]`) fire on the first week of the month only, so they roll once per listed month as before.
- Soft start (bailout, gentle flood) lasts `GRACE_WEEKS` = 12 weeks, as year 1 did.
- Lomba: panitia forms week 19, day is week 31 (17 Agustus), so prep is 12 weeks. It was 3.
- Kelurahan: January budget at week 0, December rush in week 47, harvest on the first week of October.
- Honorer promotion is 60 weeks, then a 1.7% weekly chance (was 5 years, 20% a year).

- Ranking runs every 12 weeks (a Triwulan, `RANKING_WEEKS`), not yearly. Hari chose this on 2026-10-31. RT 2★ needs 1 win and 3★ needs 2 in a row, so a yearly ranking (6.4 and 12.8 min) could not meet the 5 and 12 min targets. Titles read "Quarter n" (ID: "Triwulan n").

## Counter-argument
Budget, year report, inflation and Kader Apresiasi are now 4x rarer in wall time. That is the intent. The ranking is the one yearly beat that was kept at the old rhythm.
