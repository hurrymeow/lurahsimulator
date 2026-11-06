# Viral soft cap

TODO item: "Fix the remaining scorecard Fails that have a clear cause", row 5 (Meters stay in play). Viral was pinned for 25% or more of the builder bot's ticks in every band.

## Cause
Viral loses 10% a week (`VIRAL_DECAY`), so it settles at about 10 times what it earns each week. One Wifi opens 2 Influencer slots (+3 a week each, up to +6 with levels) and 2 Buzzer slots (+6, up to +12). From the RW on, jobs added about 90 a week and combos about 15 (builder bot, seeds 1 to 3). Viral hit 100 by late RT and stayed there for the rest of the run. The B0 and B1 Fail was the other end: Viral sat at 0 because nothing earns it yet.

## Change
Viral gains shrink with the share already filled, as Popularitas gains already do above 80: `amount *= (100 - viral) / 100`. Losses are unchanged. With the weekly decay, the level settles at 0.9g / (0.1 + 0.009g) for g earned a week: 3 settles near 21, 10 near 47, 30 near 73 and 100 at 90.

## Tried and dropped: halving Influencer and Buzzer Viral
On top of the cap, halving both jobs moved B3 and B4 only from about 86 to about 81, and pushed RT 3★ in seed 6 from week 97 to week 114. Not worth the slower star.

## Numbers (builder bot, seeds 1 to 6, 450 ticks)
| Band | Pinned, main | Pinned, here | Median, main | Median, here |
| --- | --- | --- | --- | --- |
| B0 | 100% | 100% | 0 | 0 |
| B1 | 89% | 89% | 3 | 3 |
| B2 | 87% | 7% | 100 | 73 |
| B3 | 100% | 0% | 100 | 86 |
| B4 | 100% | 0% | 100 | 87 |

Star ticks are the same within a few weeks on every seed. Seed 5 reaches all nine stars here; on main it stopped at RT 2★ within the run.

Shop income gains 0.5% per Viral (`VIRAL_INCOME`), so late shops earn about 7% less than at 100. That is welcome, since rows 14 and 15 say cash piles up.

## Not fixed
- **B0 and B1 stay at the floor.** Nothing earns Viral before the first Wifi or Mural, so row 5 still reads Fail for Viral in those bands. That is the meter not being unlocked yet, not a meter that stopped mattering. The harness could skip a meter until its first source opens. Left for the scorecard item.
- **B3 and B4 are high and flat** (p10 84, p90 87). Not pinned, but it barely moves. Sinks that spend Viral would give it swings; that is content, so check it against the Act 2 plan.

## Verdict
Self-approved under the TODO rule. GAME-DESIGN.md section 8 row 5 improves in B2 to B4, with no change to pace (rows 1, 7 and 10 use the same star ticks). UI.md: no screen change. TESTING.md: a unit test in `tests/satire.test.ts` checks the shrink and the settle point. GAME-DESIGN.md gains a "Viral soft cap" line next to the Popularitas soft cap.
