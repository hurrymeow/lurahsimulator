# Scorecard design calls: Nightly verdict after T1 to T15

Nightly run 43581598916 on main at 9e78ff1 (2026-11-14). 10 Pass, 15 Fail, 1 Unknown (row 25, Act 3 not built). The screen-bot 360 job failed on a click timeout, as on the three Nightlies before; that is not from this plan.

| Row | Before | Now | Reading |
| --- | --- | --- | --- |
| 1 Useful next move | Fail, 208s | **Pass**, 0s | T4's goal-moving actions: the builder always has something to do. |
| 7 Goal cadence | Fail | Fail, 63 misses | Goal gaps of 2 to 9 min in B1 to B3. Same cause as row 8. |
| 8 Three horizons | Unknown | **Fail** | Mid horizon 100%, short only 35% (bar 90%). Checklist lines land too rarely between stars. |
| 10 Gates that loosen | Fail | Fail | Shopkeeper RW 2★ 14 to 18 min after RW 1★. |
| 12 Star rewards | Fail | Fail | RW 3★, Kel 2★, Kel 3★, Kec 1★ to 3★ give under 2 kinds. Kel 2★ is a reader gap (path unlocks not read). |
| 13 Sources and sinks | Fail | Fail | Orang Dalam not spent in B1. T5: the only RT 1★ permit kind is too dear for B1, so the bar moves to B2. |
| 15 Cost curve | Partial | **Fail** | Median 28s (bar 30 to 120s). Income outgrows costs 6.67x from RT to RW (bar 0.7 to 1.5). RW unlocks are too cheap for RW income. |
| 16 Diminishing returns | Unknown | **Pass** | No kind leads spend in more than 2 bands (proxy). |
| 17 No dominant strategy | Fail | Fail | RT 2★ 1.48x, RT 3★ 1.72x, RW 1★ 1.61x. |
| 18 Every choice has a cost | Unknown | **Fail** | 9 decline options are strictly dominated (partTime, cctv, hajatan, sisaAnggaran, magang, lesGratis, protesWarga, hibahTunai, atapBocor). |
| 21 Combo discovery | Fail | Fail | Book reader 65% (on the bar). Random 0, because the random bot never lays a path. |
| 23 Reliability | Fail | Fail | RT 2★ late in 10 of 10 builder seeds; 2 of 15 takeovers stall (bot faults, T13). |
| 24 Stage change | Partial | **Pass** | The old map still pays 5 min after every promotion. |

## Next plan
1. Builder bot buys its generic list only after the next star's combo line is met (T5: RT 2★ ~9 to ~5 min). Then re-judge rows 7, 10, 17, 23 before any tuning.
2. `buildCombo` upgrades a member to the level a combo needs (Sayur Segar needs Warung level 3) or skips that combo (T13).
3. Takeover bot demolishes and rebuilds off-road pieces (T13 seed 5).
4. Random bot lays paths (T3).
5. Item 12 reads `PATH_UNLOCKS`. Item 13 checks the Orang Dalam sink from B2.
6. Design: price RW unlocks against RW income (row 15). Give each dominated decline option a small upside (row 18). Add mid-star checklist beats for the short horizon (row 8). Content for the thin stars (row 12).
