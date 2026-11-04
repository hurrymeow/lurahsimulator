# Scorecard

Generated 2026-11-04 by `npm run scorecard`. Checklist: GAME-DESIGN.md section 8. Wall times are at 1x unless said (8s a tick).

**3 Pass · 14 Fail · 10 Unknown** of 27 items. Unknown means the harness cannot judge the item yet, and says why.

| # | Item | Tier | Verdict | Evidence |
| --- | --- | --- | --- | --- |
| 1 | Always a useful next move | T1 | Fail | Longest wait with nothing affordable: 192s at 1x (bar 60s). Proxy: the cheapest kind not owned yet, not the goal ETA. |
| 2 | Data lint: nothing dead | T1 | Pass | No orphan buildings, events, traits (10) or combos (27). |
| 3 | Growth shows on the map | T2 | Unknown | Needs a Playwright run on the real app that counts sprites per star. |
| 4 | Skill matters | T1 | Pass | Idle over builder, median star time (bar 2x, from 2★): RT 2★ idle never. |
| 5 | Meters stay in play | T1 | Fail | Pinned within 5 of floor or cap for 25%+ of ticks: Viral B0 99%, Viral B1 91%, Viral B2 82%, Viral B3 100%, Viral B4 100%. |
| 6 | Causes are legible | T1 | Unknown | 845 of 845 Popularitas drops over 2 had a logged cause (a pop number or a bad notice). Whether the cause is shown to the player is T2. |
| 7 | Goal cadence and stop points | T1 | Fail | 63 misses, for example seed 1 B1 goal gap 184s; seed 1 B2 goal gap 128s; seed 1 B2 goal gap 496s. 10 seeds. Payoff screens counted: star, SK, quarterly report. |
| 8 | Three horizons at once | T1 | Unknown | Needs goal ETAs, which the timeline does not compute yet. The long goal (2045 review) also does not exist beyond the Emas bar. |
| 9 | Goals say what is missing | T2 | Pass | Every goal line in the data renders a count or a name. The screen check is T2. |
| 10 | Gates that loosen | T1 | Fail | 57 gaps over 2x the star gap. Examples: shopkeeper#1 RT 3★ after 8.3 min; shopkeeper#2 RT 3★ after 8.3 min; shopkeeper#3 RT 3★ after 8.3 min; shopkeeper#3 RW 2★ after 20.3 min. |
| 11 | Novelty and content depth | T1 | Fail | Novelty gaps over the band max: 22 (e.g. seed 1 B0 32s; seed 1 B1 40s; seed 2 B0 32s). Last new unlock, combo or stage at minute 19 at 2x. The 8h run needs content to about minute 480. |
| 12 | Star rewards | T1 | Fail | Cheapest new non-decor building affordable within 30s: 31 of 31 star events. Stars with one kind of reward: rt 2★, rt 3★, rw 1★, rw 2★, rw 3★, kelurahan 1★, kelurahan 2★, kelurahan 3★, kecamatan 1★, kecamatan 2★, kecamatan 3★. |
| 13 | Sources and sinks | T1 | Fail | Viral B3 never earned, Viral B4 never earned, Orang Dalam B1 never spent, Orang Dalam B4 never spent, Dana B3 never spent, Stempel B4 never earned. |
| 14 | Cash health | T1 | Fail | Cash over 5x the next key item for up to 52.3 min (bar 3 min). Lowest cash: builder 0.0M, idle 0.0M. |
| 15 | Cost curve and snowball | T1 | Fail | Seconds of income to afford the next key item, B0 to B4: median 2s (bar 30 to 120s), 95th percentile 13s (bar 300s). Income against cost growth per stage is not measured. |
| 16 | Diminishing returns | T1 | Unknown | Needs ablation runs (remove one action, measure star time). Not built. |
| 17 | No dominant strategy | T1 | Fail | Slowest over fastest of builder, shopkeeper, safety-first and Pencitraan (bar 1.3x, and a gap of at least 2 min): RT 3★: builder/safety never, RW 1★: builder/safety never, RW 2★: builder/safety never, RW 3★: builder/safety never, Kel 1★: builder/safety/pencitraan never, Kel 2★: builder/safety/pencitraan never, Kel 3★: builder/safety/pencitraan never. Cheapskate never stranded (reaches RT 2★, every takeover progresses): yes. "No bot wins every metric" is not checked. |
| 18 | Every choice has a cost | T1 | Unknown | No strictly dominated option among fixed-result choices. Rolled outcomes are skipped. |
| 19 | Laporan vs Sejahtera | T1 | Fail | Pencitraan faster to the last star both reach, by seed (bar 10 to 30%): -7%, 8%, -14%, 6%, -4%, -2%, -6%, 1%, -50%, -9%. Honest ends higher on Sejahtera in 8 of 10 seeds. Endings differ in 10 (no endings exist yet, so stage and stars stand in). |
| 20 | Management load | T1 | Fail | Most actions in a minute, by band: B0 7, B1 9, B2 31, B3 62, B4 174, B5 0, B6 0, B7 0, B8 0. Bar: no band above 1.5x the B2 peak (47). An action is a placement, an upgrade, a repair, an event answer or a promotion. |
| 21 | Combo discovery | T1 | Fail | Random placer finds a median 1.5 combos in the first 15 min (bar 3). Hint reader finds 41% of the 29 combos any bot found (bar 65 to 85%). Bots found 29 different combos in all (27 base combos plus stage combos exist). |
| 22 | Calendar rhythm | T1 | Unknown | Needs the warning lead of each fixed beat in wall seconds, which the timeline does not log yet. |
| 23 | Reliability: seeds, bad luck, recovery | T1 | Fail | RT 2★ late in 10 of 10 seeds; RT 3★ missed by 8 seeds. Soft-lock check: a builder bot took over an idle game at mid-state in 15 of 15 runs and still earned a star or a goal. The forced worst-event chain is not built. |
| 24 | Stage change feels new | T1 | Unknown | Each stage's first star opens buildings, and arrives within the star gap of promotion. Whether the old map stays useful is T2. |
| 25 | The run ends | T1 | Unknown | Act 3 and the endings do not exist yet. The builder bot finishes all content at minute 60 at 1x against a target near 480. |
| 26 | Replay drivers (optional New Game+) | T3 | Unknown | A design check, not a sim measurement. Not required for the core 8h. |
| 27 | Coming back | T2 | Unknown | Needs a Playwright save, reload and screenshot at 5s, in both languages. |

## Star times by bot

Median minute each star was earned, over the seeds that got there. A count in brackets means some seeds never did. A dash means fewer than half did.

| Bot | Seeds | RT 1★ | RT 2★ | RT 3★ | RW 1★ | RW 2★ | RW 3★ | Kel 1★ | Kel 2★ | Kel 3★ | Final pop |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| idle | 10 | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | 15 |
| builder | 10 | 1.5 | 7.0 | – (2/10) | – (2/10) | – (2/10) | – (2/10) | – (2/10) | – (2/10) | – (2/10) | 64 |
| shopkeeper | 10 | 1.9 | 6.5 | 13.9 (7/10) | 14.7 (7/10) | 27.3 (7/10) | 30.1 (7/10) | 33.2 (5/10) | 39.5 (5/10) | 44.8 (5/10) | 297 |
| safety | 10 | 1.3 | 6.9 | – (3/10) | – (3/10) | – (3/10) | – (3/10) | – (3/10) | – (3/10) | – (3/10) | 67 |
| cheapskate | 10 | 1.7 | 10.8 | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | 36 |
| pencitraan | 10 | 1.3 | 7.1 | 15.2 | 16.0 | 37.0 (6/10) | 38.1 (6/10) | – (4/10) | – (4/10) | – (4/10) | 417 |
| honest | 10 | 1.5 | 7.0 | – (2/10) | – (2/10) | – (2/10) | – (2/10) | – (2/10) | – (2/10) | – (2/10) | 56 |
| random | 10 | 11.3 | 15.9 | 19.1 (9/10) | 19.9 (9/10) | – (4/10) | – (2/10) | – (2/10) | – (2/10) | – (2/10) | 240 |
| hint | 10 | 1.5 | 6.8 | 14.8 | 15.6 | 22.7 | 24.4 | 31.1 | 33.1 | 38.4 | 381 |

## Soft-lock takeover

An idle or random bot plays to mid-game, then a builder bot takes over the state. It must earn a star or finish a goal line within 150 ticks (20 min).

| Seed | From | At tick | Progressed | Detail |
| --- | --- | --- | --- | --- |
| 1 | idle | 120 | yes | 2 stars, 4 goal lines (had 0 stars) |
| 1 | random | 100 | yes | 2 stars, 4 goal lines (had 4 stars) |
| 1 | cheapskate | 100 | yes | 0 stars, 3 goal lines (had 2 stars) |
| 2 | idle | 120 | yes | 1 stars, 4 goal lines (had 0 stars) |
| 2 | random | 100 | yes | 4 stars, 3 goal lines (had 0 stars) |
| 2 | cheapskate | 100 | yes | 0 stars, 2 goal lines (had 2 stars) |
| 3 | idle | 120 | yes | 1 stars, 3 goal lines (had 0 stars) |
| 3 | random | 100 | yes | 1 stars, 1 goal lines (had 3 stars) |
| 3 | cheapskate | 100 | yes | 2 stars, 4 goal lines (had 2 stars) |
| 4 | idle | 120 | yes | 1 stars, 4 goal lines (had 0 stars) |
| 4 | random | 100 | yes | 4 stars, 3 goal lines (had 0 stars) |
| 4 | cheapskate | 100 | yes | 2 stars, 4 goal lines (had 2 stars) |
| 5 | idle | 120 | yes | 4 stars, 10 goal lines (had 0 stars) |
| 5 | random | 100 | yes | 2 stars, 3 goal lines (had 2 stars) |
| 5 | cheapskate | 100 | yes | 0 stars, 2 goal lines (had 2 stars) |

## Changes since the last golden trend

- 1 Always a useful next move: Pass to Fail
- 2 Data lint: nothing dead: Unknown to Pass
- 18 Every choice has a cost: Fail to Unknown
- 20 Management load: Pass to Fail

## Not measured yet

- 3 Growth shows on the map (T2): Needs a Playwright run on the real app that counts sprites per star.
- 6 Causes are legible (T1): 845 of 845 Popularitas drops over 2 had a logged cause (a pop number or a bad notice). Whether the cause is shown to the player is T2.
- 8 Three horizons at once (T1): Needs goal ETAs, which the timeline does not compute yet. The long goal (2045 review) also does not exist beyond the Emas bar.
- 16 Diminishing returns (T1): Needs ablation runs (remove one action, measure star time). Not built.
- 18 Every choice has a cost (T1): No strictly dominated option among fixed-result choices. Rolled outcomes are skipped.
- 22 Calendar rhythm (T1): Needs the warning lead of each fixed beat in wall seconds, which the timeline does not log yet.
- 24 Stage change feels new (T1): Each stage's first star opens buildings, and arrives within the star gap of promotion. Whether the old map stays useful is T2.
- 25 The run ends (T1): Act 3 and the endings do not exist yet. The builder bot finishes all content at minute 60 at 1x against a target near 480.
- 26 Replay drivers (optional New Game+) (T3): A design check, not a sim measurement. Not required for the core 8h.
- 27 Coming back (T2): Needs a Playwright save, reload and screenshot at 5s, in both languages.
