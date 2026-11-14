# Scorecard bot fixes and design rows: Nightly verdict

Nightly run 43629294617 on main at ee8d05a (2026-11-14), after #445 to #453. 10 Pass, 15 Fail, 2 Unknown (25 Act 3 not built, 26 optional).

Two screen-bot jobs failed. 360-id is the known click timeout. 412-en scored 18 of 65 checkpoints (bar 90%) and never reached RT 3★, close to the known ~31% (the screen bot cannot see tint). Neither comes from these plans, which changed bots, the scorecard reader, star rewards and RW prices.

| Row | Before (9e78ff1) | Now (ee8d05a) | Reading |
| --- | --- | --- | --- |
| 1 Useful next move | Pass | Pass | 0s idle. |
| 7 Goal cadence | Fail, 63 misses | Fail, 55 misses | Goal gaps of 2 to 11 min in B1 to B3. Same cause as row 8. |
| 8 Three horizons | Fail, short 35% | Fail, short 62% | Step events count now. Still under 90%. Needs mid-star checklist lines (design). |
| 10 Gates that loosen | Fail | Fail, worse | RW 1★ to RW 2★ now 13 to 23 min. Caused by the RW price doubling (design-rows T5). |
| 12 Star rewards | Fail, 6 thin stars | Fail, 2 thin stars | Only Kec 2★ and 3★ give one kind. Waits for Kecamatan slice 2. Longest run without a new system: 3 stars (bar 1). |
| 13 Sources and sinks | Fail | Fail | Orang Dalam unspent in B3 to B5. Rupiah unspent in B5 is the bot stopping at the last star. |
| 15 Cost curve | Fail, 6.67x | Fail, 2.76x and 3.20x | Price doubling halved the RT to RW gap but slowed RW. Bar is 0.7 to 1.5. |
| 17 No dominant strategy | Fail | Fail | RT 2★ 1.44x, RT 3★ 1.74x, RW 1★ 1.64x, RW 2★ 1.32x. |
| 18 Every choice has a cost | Fail, 9 dominated | **Pass** | Rolled outcomes are judged by mean; no dominated option left. |
| 21 Combo discovery | Fail, random 0 | Fail, random 1 | Random lays paths now. Book reader 63% (bar 65%), just under. |
| 23 Reliability | Fail, 2 of 15 stall | Fail, 15 of 15 progress | Takeover soft-lock check passes. Row fails only on RT 2★ late in 10 of 10 seeds (builder 7.9 min). |
| 24 Stage change | Pass | Pass | Old map pays after every promotion. |

New fails to watch:
- 6 Causes are legible: 755 of 756 drops have a cause. One drop is uncaused. Check which pop.
- 20 Management load: B3 peaks at 45 actions a minute against a 41 bar. The builder plays harder in RW now that RW costs more.
- Builder RW 2★ is missed on 1 of 10 seeds.

## Verdict

The bot fixes did their job. Takeovers never stall, the random bot finds combos and the builder always has a move. The remaining fails are game balance, not bot faults.

## Next plan
1. Row 10 and 15: lower RW 1★ to 2★ goal cost or raise RT-tier income, not RW prices again. Price doubling moved the ratio from 6.67x to 2.76x and cost 5 to 8 min of RW gating. Measure before and after with the Nightly.
2. Row 8 and 7: add one checklist line between each pair of stars in RT and RW.
3. Row 13: give Orang Dalam a sink in Kelurahan and Kecamatan.
4. Row 6: find the one uncaused Popularitas drop.
5. Row 12: Kec 2★ and 3★ content comes with Kecamatan slice 2.
