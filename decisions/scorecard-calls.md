# Scorecard Fails and Unknowns: the calls (2026-11-07)

Hari was away and said "you decide". Source: Nightly run 42354930430 on main fd75a85 (5 Pass, 12 Fail, 10 Unknown). Each call has its counter-argument. Checked against GAME-DESIGN.md section 8.

## Harness changes in this PR

| Row | Call | Counter-argument |
| --- | --- | --- |
| 5 | Viral is judged only after the first tick it rises above 0. Before that there is no source to use. Aman at the cap does not count as pinned, because Aman goals ask the player to reach a level and hold it. | A cap-pinned Aman could hide a meter with no tension. Floor-pinned Aman still fails, and Popularitas, Viral and Sejahtera keep both ends. |
| 13 | Same Viral rule. | Same. |
| 10 | The cheapskate bot leaves the "gates that loosen" check. Its bar is "reaches RT 2★ and never soft-locks" (`decisions/cheapskate-bar.md`), checked in item 17. | Gates could still strand a slow player at RW. The takeover check (15 of 15) covers that case. |
| 22 | Counted as warned beats: the Triwulan ranking and quarterly report (12 weeks, 96s ahead), and the Lomba Agustusan (panitia card 12 weeks ahead, 96s). Computed from calendar constants, not the timeline. The row now Fails honestly: the Lomba returns every 6.4 min, bar 10 min. | The Triwulan is a countdown the player can see, not a card, so "warned" is generous. Beats per stage are not counted yet. |

## Calls without code

- **Row 22 follow-up:** make the Lomba every second year or add a Lomba-free year. Gameplay change with test fallout, so it goes to TODO, not this PR.
- **Rows 3, 6, 27:** one Playwright slice for the DeepSeek executor (one spec file, one test per row). Stay Unknown until it lands.
- **Rows 25, 26:** stay Unknown until Act 3 exists (25) and by design (26, T3).
- **Row 24, 8, 16, 18:** stay Unknown. 8 and 16 need new harness features (goal ETAs, ablation runs); not worth building before Act 2 content settles.
- **Row 17 now Pass:** the Pencitraan collapse of `decisions/scorecard-pencitraan-probe.md` is gone after #348 (all five bots reach RT 3★ on 10 of 10 seeds). No balance change needed. Counter: the bar ignores "no bot wins every metric", so Pass is partly generous.
- **Row 19 (Laporan vs Sejahtera):** keep Fail. Pencitraan is 0% faster in 9 of 10 seeds, because both bots reach the last star on the same tick. Real balance work (make Pencitraan faster or Honest slower), not a bot gap. Counter: the row uses stars as a stand-in for endings that do not exist, so it may flip once Act 3 lands. Wait for Act 3.
- **Rows 1, 7, 11, 12, 14, 15, 21, 23:** keep Fail. They are real content or pacing gaps (waits at Kecamatan prices, goal gaps in B2/B3, one reward kind per star, cash pile-up for up to 6 min, hint reader finds 40% of combos). They need design choices per row; none is a harness bug. Each stays in TODO "Fix the remaining scorecard Fails".
- **Row 13 leftovers:** Orang Dalam never spent in B1 and B4, Stempel never earned in B4. Builder bots do not spend Orang Dalam, so this is a bot gap. TODO.
