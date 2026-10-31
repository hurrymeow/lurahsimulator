# Scorecard

Generated 2026-10-31 by `npm run scorecard`. Checklist: GAME-DESIGN.md section 8. Wall times are at 1x unless said (8s a tick).

**4 Pass · 13 Fail · 10 Unknown** of 27 items. Unknown means the harness cannot judge the item yet, and says why.

| # | Item | Tier | Verdict | Evidence |
| --- | --- | --- | --- | --- |
| 1 | Always a useful next move | T1 | Pass | Longest wait with nothing affordable: 0s at 1x (bar 60s). Proxy: the cheapest kind not owned yet, not the goal ETA. |
| 2 | Data lint: nothing dead | T1 | Unknown | No orphan buildings or events. Traits and combos are not linted yet. Verdict held at Unknown because traits and combos are unchecked. |
| 3 | Growth shows on the map | T2 | Unknown | Needs a Playwright run on the real app that counts sprites per star. |
| 4 | Skill matters | T1 | Pass | Idle over builder, median star time (bar 2x, from 2★): RT 2★ idle never, RT 3★ idle never, RW 1★ idle never, RW 2★ idle never, RW 3★ idle never, Kel 1★ idle never. |
| 5 | Meters stay in play | T1 | Fail | Pinned within 5 of floor or cap for 25%+ of ticks: Viral B0 100%, Viral B1 91%, Viral B2 76%, Viral B3 100%, Viral B4 100%, Aman B4 100%. |
| 6 | Causes are legible | T1 | Unknown | 396 of 396 Popularitas drops over 2 had a logged cause (a pop number or a bad notice). Whether the cause is shown to the player is T2. |
| 7 | Goal cadence and stop points | T1 | Fail | 36 misses, for example seed 1 B1 goal gap 144s; seed 1 B2 goal gap 128s; seed 1 B2 goal gap 136s. 10 seeds. Payoff screens counted: star, SK, quarterly report. |
| 8 | Three horizons at once | T1 | Unknown | Needs goal ETAs, which the timeline does not compute yet. The long goal (2045 review) also does not exist beyond the Emas bar. |
| 9 | Goals say what is missing | T2 | Pass | Every goal line in the data renders a count or a name. The screen check is T2. |
| 10 | Gates that loosen | T1 | Fail | 33 gaps over 2x the star gap. Examples: shopkeeper#1 stuck before Kel 2★; shopkeeper#2 stuck before Kel 2★; shopkeeper#3 stuck before Kel 2★; shopkeeper#4 stuck before Kel 2★. |
| 11 | Novelty and content depth | T1 | Fail | Novelty gaps over the band max: 20 (e.g. seed 1 B0 24s; seed 1 B0 16s; seed 2 B0 24s). Last new unlock, combo or stage at minute 11 at 2x. The 8h run needs content to about minute 480. |
| 12 | Star rewards | T1 | Fail | Cheapest new non-decor building affordable within 30s: 69 of 69 star events. Stars with one kind of reward: rt 2★, rt 3★, rw 1★, rw 2★, rw 3★, kelurahan 1★, kelurahan 2★, kelurahan 3★. |
| 13 | Sources and sinks | T1 | Fail | Rupiah B4 never spent, Viral B3 never earned, Viral B4 never earned, Orang Dalam B0 never spent, Orang Dalam B4 never spent. Dana, Stempel and Anggaran are not tracked in the timeline yet. |
| 14 | Cash health | T1 | Fail | Cash over 5x the next key item for up to 36.3 min (bar 3 min). Lowest cash: builder 0.0M, idle 0.0M. |
| 15 | Cost curve and snowball | T1 | Fail | Seconds of income to afford the next key item, B0 to B4: median 3s (bar 30 to 120s), 95th percentile 10s (bar 300s). Income against cost growth per stage is not measured. |
| 16 | Diminishing returns | T1 | Unknown | Needs ablation runs (remove one action, measure star time). Not built. |
| 17 | No dominant strategy | T1 | Fail | Slowest over fastest of builder, shopkeeper, safety-first and Pencitraan (bar 1.3x): RT 1★ 15.50x, RT 2★ 1.49x, RT 3★ 1.33x, Kel 2★: builder/shopkeeper/pencitraan never, Kel 3★: builder/shopkeeper/pencitraan never. Cheapskate over builder (bar 2x): RT 1★ 6.5x, RT 2★ 2.1x, RT 3★ never, RW 1★ never, RW 2★ never, RW 3★ never, Kel 1★ never. "No bot wins every metric" is not checked. |
| 18 | Every choice has a cost | T1 | Fail | Strictly dominated options: kecamatan#1, kecamatan#2, kecamatanTertib#1, kecamatanTertib#2, kecamatanSehat#1, kecamatanSehat#2, kecamatanDigital#1, kecamatanDigital#2, guntingPita#0, lubangViral#2. Only options with fixed results are compared; advice with rolled outcomes is skipped. |
| 19 | Laporan vs Sejahtera | T1 | Fail | Pencitraan faster to the last star both reach, by seed (bar 10 to 30%): -9%, -18%, -13%, -18%, -10%, -21%, -10%, -14%, -14%, -22%. Honest ends higher on Sejahtera in 10 of 10 seeds. Endings differ in 9 (no endings exist yet, so stage and stars stand in). |
| 20 | Management load | T1 | Pass | Most actions in a minute, by band: B0 9, B1 12, B2 133, B3 117, B4 85, B5 0, B6 0, B7 0, B8 0. Bar: no band above 1.5x the B2 peak (200). An action is a placement, an upgrade, a repair, an event answer or a promotion. |
| 21 | Combo discovery | T1 | Fail | Random placer finds a median 0 combos in the first 15 min (bar 3). Hint reader finds 4% of the 28 combos any bot found (bar 65 to 85%). Bots found 28 different combos in all (27 base combos plus stage combos exist). |
| 22 | Calendar rhythm | T1 | Unknown | Needs the warning lead of each fixed beat in wall seconds, which the timeline does not log yet. |
| 23 | Reliability: seeds, bad luck, recovery | T1 | Fail | soft-lock: 2 of 15 takeovers did not progress. Soft-lock check: a builder bot took over an idle game at mid-state in 13 of 15 runs and still earned a star or a goal. The forced worst-event chain is not built. |
| 24 | Stage change feels new | T1 | Unknown | Each stage's first star opens buildings, and arrives within the star gap of promotion. Whether the old map stays useful is T2. |
| 25 | The run ends | T1 | Unknown | Act 3 and the endings do not exist yet. The builder bot finishes all content at minute 27 at 1x against a target near 480. |
| 26 | Replay drivers (optional New Game+) | T3 | Unknown | A design check, not a sim measurement. Not required for the core 8h. |
| 27 | Coming back | T2 | Unknown | Needs a Playwright save, reload and screenshot at 5s, in both languages. |

## Star times by bot

Median minute each star was earned across seeds. A dash means a seed never got there.

| Bot | Seeds | RT 1★ | RT 2★ | RT 3★ | RW 1★ | RW 2★ | RW 3★ | Kel 1★ | Kel 2★ | Kel 3★ | Final pop |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| idle | 10 | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | 15 |
| builder | 10 | 0.3 | 4.5 | 6.7 | 7.5 | 10.7 | 13.0 | 14.9 | – (9/10) | – (9/10) | 200 |
| shopkeeper | 10 | 4.1 | 5.1 | 6.8 | 7.6 | 10.9 | 13.3 | 15.2 | – (0/10) | – (0/10) | 284 |
| safety | 10 | 0.3 | 4.5 | 6.8 | 7.6 | 10.3 | 13.4 | 15.3 | 20.8 | 25.8 | 200 |
| cheapskate | 10 | 1.7 | 9.7 | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | 39 |
| pencitraan | 10 | 0.3 | 6.7 | 8.9 | 9.7 | 12.0 | 15.4 | 17.3 | – (0/10) | – (0/10) | 274 |
| honest | 10 | 0.3 | 4.5 | 6.7 | 7.5 | 10.7 | 13.0 | 14.9 | – (9/10) | – (9/10) | 200 |
| random | 10 | 16.7 | 21.0 | 21.7 | 22.5 | – (3/10) | – (3/10) | – (3/10) | – (1/10) | – (0/10) | 130 |
| hint | 10 | 0.3 | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | – (0/10) | 66 |

## Soft-lock takeover

An idle or random bot plays to mid-game, then a builder bot takes over the state. It must earn a star or finish a goal line within 150 ticks (20 min).

| Seed | From | At tick | Progressed | Detail |
| --- | --- | --- | --- | --- |
| 1 | idle | 120 | yes | 7 stars, 10 goal lines (had 0 stars) |
| 1 | random | 100 | yes | 4 stars, 5 goal lines (had 3 stars) |
| 1 | cheapskate | 100 | yes | 0 stars, 1 goal lines (had 2 stars) |
| 2 | idle | 120 | yes | 5 stars, 8 goal lines (had 0 stars) |
| 2 | random | 100 | NO | no star or goal in 150 ticks (had 0 stars) |
| 2 | cheapskate | 100 | yes | 0 stars, 1 goal lines (had 2 stars) |
| 3 | idle | 120 | yes | 6 stars, 9 goal lines (had 0 stars) |
| 3 | random | 100 | yes | 5 stars, 6 goal lines (had 2 stars) |
| 3 | cheapskate | 100 | yes | 5 stars, 7 goal lines (had 2 stars) |
| 4 | idle | 120 | yes | 7 stars, 10 goal lines (had 0 stars) |
| 4 | random | 100 | NO | no star or goal in 150 ticks (had 0 stars) |
| 4 | cheapskate | 100 | yes | 5 stars, 7 goal lines (had 2 stars) |
| 5 | idle | 120 | yes | 2 stars, 3 goal lines (had 0 stars) |
| 5 | random | 100 | yes | 7 stars, 7 goal lines (had 0 stars) |
| 5 | cheapskate | 100 | yes | 5 stars, 8 goal lines (had 2 stars) |

## Not measured yet

- 2 Data lint: nothing dead (T1): No orphan buildings or events. Traits and combos are not linted yet. Verdict held at Unknown because traits and combos are unchecked.
- 3 Growth shows on the map (T2): Needs a Playwright run on the real app that counts sprites per star.
- 6 Causes are legible (T1): 396 of 396 Popularitas drops over 2 had a logged cause (a pop number or a bad notice). Whether the cause is shown to the player is T2.
- 8 Three horizons at once (T1): Needs goal ETAs, which the timeline does not compute yet. The long goal (2045 review) also does not exist beyond the Emas bar.
- 16 Diminishing returns (T1): Needs ablation runs (remove one action, measure star time). Not built.
- 22 Calendar rhythm (T1): Needs the warning lead of each fixed beat in wall seconds, which the timeline does not log yet.
- 24 Stage change feels new (T1): Each stage's first star opens buildings, and arrives within the star gap of promotion. Whether the old map stays useful is T2.
- 25 The run ends (T1): Act 3 and the endings do not exist yet. The builder bot finishes all content at minute 27 at 1x against a target near 480.
- 26 Replay drivers (optional New Game+) (T3): A design check, not a sim measurement. Not required for the core 8h.
- 27 Coming back (T2): Needs a Playwright save, reload and screenshot at 5s, in both languages.
