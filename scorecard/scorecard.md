# Scorecard

Generated 2026-11-08 by `npm run scorecard`. Checklist: GAME-DESIGN.md section 8. Wall times are at 1x unless said (8s a tick).

**9 Pass · 12 Fail · 6 Unknown** of 27 items. Unknown means the harness cannot judge the item yet, and says why.

| # | Item | Tier | Verdict | Evidence |
| --- | --- | --- | --- | --- |
| 1 | Always a useful next move | T1 | Fail | Longest wait with nothing affordable: 240s at 1x (bar 60s). Proxy: the cheapest kind not owned yet, not the goal ETA. |
| 2 | Data lint: nothing dead | T1 | Pass | No orphan buildings, events, traits (10) or combos (27). |
| 3 | Growth shows on the map | T2 | Pass | Check: the map draws more buildings at each RT star, 1★ to 3★, on the developer seed (N not set yet). It counts the draw list, not sprites in view. Spec passed in en and id at 412px. |
| 4 | Skill matters | T1 | Pass | Idle over builder, median star time (bar 2x, from 2★): RT 2★ idle never, RT 3★ idle never, RW 1★ idle never, RW 2★ idle never, RW 3★ idle never, Kel 1★ idle never, Kel 2★ idle never, Kel 3★ idle never. |
| 5 | Meters stay in play | T1 | Fail | Pinned within 5 of floor or cap for 25%+ of ticks: Viral B0 98%, Viral B1 94%, Aman B3 31%, Aman B4 100%. |
| 6 | Causes are legible | T1 | Pass | 615 of 615 Popularitas drops over 2 had a logged cause (a pop number or a bad notice). Shown check: a queue-caused fall names its cause in the Log sheet; not every drop is checked. Spec passed in en and id at 412px. |
| 7 | Goal cadence and stop points | T1 | Fail | 63 misses, for example seed 1 B2 goal gap 216s; seed 1 B2 goal gap 280s; seed 1 B3 goal gap 200s. 10 seeds. Payoff screens counted: star, SK, quarterly report. |
| 8 | Three horizons at once | T1 | Unknown | Needs goal ETAs, which the timeline does not compute yet. The long goal (2045 review) also does not exist beyond the Emas bar. |
| 9 | Goals say what is missing | T2 | Pass | Every goal line in the data renders a count or a name. The screen check is T2. |
| 10 | Gates that loosen | T1 | Pass | No gap over 2x the star gap for any strategy bot. The cheapskate bar is its own check (item 17). |
| 11 | Novelty and content depth | T1 | Fail | Novelty gaps over the band max: 21 (e.g. seed 1 B0 32s; seed 1 B1 40s; seed 2 B0 32s). Last new unlock, combo or stage at minute 17 at 2x. The 8h run needs content to about minute 480. |
| 12 | Star rewards | T1 | Fail | Cheapest new non-decor building affordable within 30s: 70 of 70 star events. Stars with one kind of reward: rt 2★, rt 3★, rw 1★, rw 2★, rw 3★, kelurahan 1★, kelurahan 2★, kelurahan 3★, kecamatan 1★, kecamatan 2★, kecamatan 3★. |
| 13 | Sources and sinks | T1 | Fail | Orang Dalam B1 never spent, Orang Dalam B4 never spent, Stempel B4 never earned. |
| 14 | Cash health | T1 | Fail | Cash over 5x the next key item for up to 6.0 min (bar 3 min). Lowest cash: builder 0.0M, idle 0.0M. |
| 15 | Cost curve and snowball | T1 | Fail | Seconds of income to afford the next key item, B0 to B4: median 5s (bar 30 to 120s), 95th percentile 76s (bar 300s). Income against cost growth per stage is not measured. |
| 16 | Diminishing returns | T1 | Unknown | Needs ablation runs (remove one action, measure star time). Not built. |
| 17 | No dominant strategy | T1 | Pass | Slowest over fastest of builder, shopkeeper, safety-first and Pencitraan (bar 1.3x, and a gap of at least 2 min): all within. Cheapskate never stranded (reaches RT 2★, every takeover progresses): yes. "No bot wins every metric" is not checked. |
| 18 | Every choice has a cost | T1 | Unknown | No strictly dominated option among fixed-result choices. Rolled outcomes are skipped. |
| 19 | Laporan vs Sejahtera | T1 | Fail | Pencitraan faster to the last star both reach, by seed (bar 10 to 30%): 0%, 0%, 0%, 0%, 0%, 0%, 0%, 0%, 0%, 0%. Honest ends higher on Sejahtera in 10 of 10 seeds. Endings differ in 0 (no endings exist yet, so stage and stars stand in). |
| 20 | Management load | T1 | Pass | Most actions in a minute, by band: B0 7, B1 9, B2 47, B3 49, B4 37, B5 0, B6 0, B7 0, B8 0. Bar: no band above 1.5x the B2 peak (71). An action is a placement, an upgrade, a repair, an event answer or a promotion. |
| 21 | Combo discovery | T1 | Fail | Random placer finds a median 1.5 combos in the first 15 min (bar 3). Hint reader finds 40% of the 29 combos any bot found (bar 65 to 85%). Bots found 29 different combos in all (27 base combos plus stage combos exist). |
| 22 | Calendar rhythm | T1 | Pass | Fixed beats: Triwulan ranking and quarterly report every 12 weeks, warned 96s ahead; Lomba Agustusan, warned 96s ahead (bar 30s). Big days: the Lomba comes every 12.8 min (bar 10 min apart). Beats per stage are not counted by stage yet. |
| 23 | Reliability: seeds, bad luck, recovery | T1 | Fail | RT 2★ late in 10 of 10 seeds; RT 3★ late in 10 of 10 seeds. Soft-lock check: a builder bot took over an idle game at mid-state in 15 of 15 runs and still earned a star or a goal. The forced worst-event chain is not built. |
| 24 | Stage change feels new | T1 | Unknown | Each stage's first star opens buildings, and arrives within the star gap of promotion. Whether the old map stays useful is T2. |
| 25 | The run ends | T1 | Unknown | Act 3 and the endings do not exist yet. The builder bot finishes all content at minute 39 at 1x against a target near 480. |
| 26 | Replay drivers (optional New Game+) | T3 | Unknown | A design check, not a sim measurement. Not required for the core 8h. |
| 27 | Coming back | T2 | Fail | Check: save, reload, wait 5s; same buildings and residents, the same goal line on screen, legibility scan clean, screenshot kept. Spec passed in en and id at 412px. But the goal's progress (have and need) is a tap away, not on screen, in en and id. |

## Star times by bot

Median minute each star was earned, over the seeds that got there. A count in brackets means some seeds never did. A dash means fewer than half did.

| Bot | Seeds | RT 1★ | RT 2★ | RT 3★ | RW 1★ | RW 2★ | RW 3★ | Kel 1★ | Kel 2★ | Kel 3★ | Final pop |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| idle | 10 | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | 14 |
| builder | 10 | 1.5 | 6.9 | 13.5 | 14.3 | 19.2 | 21.5 | 28.1 | 33.1 | 38.4 | 407 |
| shopkeeper | 10 | 1.9 | 6.9 | 13.4 | 14.2 | 19.2 | 21.5 | 28.2 | 33.1 | 38.4 | 360 |
| safety | 10 | 1.3 | 6.8 | 13.4 | 14.2 | 19.2 | 21.2 | 27.9 | 33.1 | 38.4 | 409 |
| cheapskate | 10 | 1.7 | 12.4 | 33.5 (8/10) | 34.5 (8/10) | – (3/10) | – (3/10) | – (3/10) | – (2/10) | – (1/10) | 169 |
| pencitraan | 10 | 1.3 | 7.9 | 13.5 | 14.3 | 19.2 | 21.3 | 27.9 | 33.1 | 38.4 | 373 |
| honest | 10 | 1.5 | 6.9 | 13.8 | 14.6 | 19.2 | 21.5 | 28.2 | 33.1 | 38.4 | 402 |
| random | 10 | 9.3 | 16.5 | 17.6 | 18.4 | 24.9 (8/10) | – (2/10) | – (2/10) | – (2/10) | – (2/10) | 218 |
| hint | 10 | 1.5 | 6.5 | 14.5 | 15.3 | 19.2 | 21.9 | 28.5 | 33.1 | 38.4 | 385 |

## Band table, B0 to B5

Worst seed per bot and band. A dash means the run ended before the band began (or the bot stops at the last star). Gaps are inside the band window only. A stop point is a star, a promotion or a report. Bars: GAME-DESIGN.md section 8.

### Novelty max (seconds) (bar 10, 30, 30, 45, 60 for B0 to B4)

| Bot | B0 | B1 | B2 | B3 | B4 | B5 |
| --- | --- | --- | --- | --- | --- | --- |
| idle | 40 | 64 | 72 | 72 | 96 | – |
| builder | 32 | 32 | 32 | 8 | 16 | – |
| shopkeeper | 16 | 52 | 40 | 16 | 40 | – |
| safety | 32 | 32 | 32 | 8 | 16 | – |
| cheapskate | 24 | 40 | 56 | 56 | 48 | – |
| pencitraan | 32 | 40 | 24 | 8 | 48 | – |
| honest | 32 | 32 | 32 | 8 | 16 | – |
| random | 40 | 48 | 48 | 40 | 96 | – |
| hint | 32 | 32 | 32 | 8 | 16 | – |

### Goal max (seconds) (bar 90, 120, 180, 240 for B1 to B4)

| Bot | B0 | B1 | B2 | B3 | B4 | B5 |
| --- | --- | --- | --- | --- | --- | --- |
| idle | 60 | 164 | 600 | 900 | 1800 | – |
| builder | 52 | 212 | 368 | 244 | 312 | – |
| shopkeeper | 56 | 188 | 400 | 296 | 312 | – |
| safety | 52 | 212 | 400 | 224 | 312 | – |
| cheapskate | 52 | 196 | 308 | 900 | 1800 | – |
| pencitraan | 52 | 164 | 352 | 240 | 312 | – |
| honest | 52 | 212 | 368 | 244 | 312 | – |
| random | 60 | 240 | 600 | 900 | 1800 | – |
| hint | 52 | 192 | 464 | 200 | 312 | – |

### Star gap (minutes between stars or a promotion) (bar 4 min RT, 7 min RW, 10 min Kelurahan, 15 to 25 min Kecamatan)

| Bot | B0 | B1 | B2 | B3 | B4 | B5 |
| --- | --- | --- | --- | --- | --- | --- |
| idle | 1.0 | 4.0 | 10.0 | 15.0 | 30.0 | – |
| builder | 1.0 | 3.7 | 7.5 | 6.5 | 5.3 | – |
| shopkeeper | 1.0 | 3.1 | 7.1 | 6.5 | 5.3 | – |
| safety | 1.0 | 3.7 | 6.9 | 6.5 | 5.3 | – |
| cheapskate | 1.0 | 3.3 | 10.0 | 15.0 | 30.0 | – |
| pencitraan | 1.0 | 3.7 | 6.3 | 6.5 | 5.3 | – |
| honest | 1.0 | 3.7 | 7.9 | 6.5 | 5.3 | – |
| random | 1.0 | 4.0 | 10.0 | 15.0 | 30.0 | – |
| hint | 1.0 | 3.7 | 8.0 | 6.5 | 5.3 | – |

### Stop point gap (minutes) (bar 15 min in B3 and B4, 20 min in B5)

| Bot | B0 | B1 | B2 | B3 | B4 | B5 |
| --- | --- | --- | --- | --- | --- | --- |
| idle | 1.0 | 1.6 | 1.6 | 1.6 | 1.6 | – |
| builder | 1.0 | 1.6 | 1.6 | 1.6 | 1.6 | – |
| shopkeeper | 1.0 | 1.6 | 1.6 | 1.6 | 1.6 | – |
| safety | 1.0 | 1.6 | 1.6 | 1.6 | 1.6 | – |
| cheapskate | 1.0 | 1.6 | 1.6 | 1.6 | 1.6 | – |
| pencitraan | 1.0 | 1.6 | 1.6 | 1.6 | 1.6 | – |
| honest | 1.0 | 1.6 | 1.6 | 1.6 | 1.6 | – |
| random | 1.0 | 1.6 | 1.6 | 1.6 | 1.6 | – |
| hint | 1.0 | 1.6 | 1.6 | 1.6 | 1.6 | – |


## Kecamatan rows (hint path)

The hint bot plays a new game to Kelurahan 3 stars, then the Kecamatan bot plays on. 10 of 10 seeds reached the Kecamatan, 0 reached its 3rd star. Times are at 1x. Bot gaps are logged, not counted as game fails.

| Seed | Promoted (min) | 1★ / 2★ / 3★ after promotion (min) | First pinjol after promotion | Longest stop gap (report counts) | Longest gap, stars only | Longest novelty / goal gap | Pinjol at end | Judol peak / mean (%) | Baliho share of income (%) | Baliho Rp a week |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 38.5 min | – | 0.1 min | 1.6 min | 93.3 min | 0.9 min / 13.7 min | 45% | 84 / 76.3 | no Baliho | – |
| 2 | 38.5 min | – | 0.1 min | 1.6 min | 93.3 min | 0.8 min / 13.6 min | 40% | 87 / 77.1 | no Baliho | – |
| 3 | 38.5 min | – | 0.1 min | 1.6 min | 93.3 min | 0.9 min / 15.1 min | 49% | 88 / 77 | no Baliho | – |
| 4 | 38.5 min | – | 0.1 min | 1.6 min | 93.3 min | 0.9 min / 13.5 min | 44% | 86 / 76.6 | no Baliho | – |
| 5 | 38.5 min | – | 0.1 min | 1.6 min | 93.3 min | 0.9 min / 13.7 min | 31% | 90 / 77.7 | no Baliho | – |
| 6 | 38.5 min | – | 0.1 min | 1.6 min | 93.3 min | 0.9 min / 15.1 min | 51% | 88 / 76.4 | no Baliho | – |
| 7 | 38.5 min | – | 0.1 min | 1.6 min | 93.3 min | 0.9 min / 15.1 min | 29% | 89 / 76.7 | no Baliho | – |
| 8 | 38.5 min | – | 0.1 min | 1.6 min | 93.3 min | 0.9 min / 13.6 min | 37% | 87 / 77.1 | no Baliho | – |
| 9 | 38.5 min | – | 0.1 min | 1.6 min | 93.3 min | 0.9 min / 13.3 min | 30% | 87 / 76.9 | no Baliho | – |
| 10 | 38.5 min | – | 0.1 min | 1.6 min | 93.3 min | 0.9 min / 13.7 min | 43% | 85 / 76 | no Baliho | – |

| Row | Bar | Result | Verdict |
| --- | --- | --- | --- |
| First pinjol case | within 3 min of promotion | 10 of 10 seeds in time. Median 0.1 min where it happened; never on 0 seeds. | Pass |
| Stop point every 20 min | longest gap at most 20 min | With a report counted as a stop (as scorecard item 7 does): 10 of 10 seeds, longest 1.6 min. Reports come every ~1.6 min, so this cannot fail. Stars and promotion only: 0 of 10 seeds, longest 93.3 min. | Fail (stars only) |
| Judol share and Baliho income | measured, no bar yet | Judol mean share 76.8% (median of seeds). Baliho never built by the bot. | Measured |


## Soft-lock takeover

An idle or random bot plays to mid-game, then a builder bot takes over the state. It must earn a star or finish a goal line within 150 ticks (20 min).

| Seed | From | At tick | Progressed | Detail |
| --- | --- | --- | --- | --- |
| 1 | idle | 120 | yes | 4 stars, 6 goal lines (had 0 stars) |
| 1 | random | 100 | yes | 4 stars, 4 goal lines (had 4 stars) |
| 1 | cheapskate | 100 | yes | 4 stars, 6 goal lines (had 2 stars) |
| 2 | idle | 120 | yes | 4 stars, 5 goal lines (had 0 stars) |
| 2 | random | 100 | yes | 6 stars, 5 goal lines (had 0 stars) |
| 2 | cheapskate | 100 | yes | 4 stars, 7 goal lines (had 2 stars) |
| 3 | idle | 120 | yes | 4 stars, 7 goal lines (had 0 stars) |
| 3 | random | 100 | yes | 5 stars, 8 goal lines (had 1 stars) |
| 3 | cheapskate | 100 | yes | 4 stars, 5 goal lines (had 2 stars) |
| 4 | idle | 120 | yes | 4 stars, 6 goal lines (had 0 stars) |
| 4 | random | 100 | yes | 5 stars, 5 goal lines (had 1 stars) |
| 4 | cheapskate | 100 | yes | 4 stars, 7 goal lines (had 2 stars) |
| 5 | idle | 120 | yes | 4 stars, 4 goal lines (had 0 stars) |
| 5 | random | 100 | yes | 6 stars, 7 goal lines (had 2 stars) |
| 5 | cheapskate | 100 | yes | 4 stars, 8 goal lines (had 2 stars) |

## Changes since the last golden trend

- 3 Growth shows on the map: Unknown to Pass
- 6 Causes are legible: Unknown to Pass
- 10 Gates that loosen: Fail to Pass
- 17 No dominant strategy: Fail to Pass
- 20 Management load: Fail to Pass
- 22 Calendar rhythm: Unknown to Pass
- 27 Coming back: Unknown to Fail

## Not measured yet

- 8 Three horizons at once (T1): Needs goal ETAs, which the timeline does not compute yet. The long goal (2045 review) also does not exist beyond the Emas bar.
- 16 Diminishing returns (T1): Needs ablation runs (remove one action, measure star time). Not built.
- 18 Every choice has a cost (T1): No strictly dominated option among fixed-result choices. Rolled outcomes are skipped.
- 24 Stage change feels new (T1): Each stage's first star opens buildings, and arrives within the star gap of promotion. Whether the old map stays useful is T2.
- 25 The run ends (T1): Act 3 and the endings do not exist yet. The builder bot finishes all content at minute 39 at 1x against a target near 480.
- 26 Replay drivers (optional New Game+) (T3): A design check, not a sim measurement. Not required for the core 8h.
