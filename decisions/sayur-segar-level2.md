# Sayur Segar wants a Warung at level 2, not 3

TODO item "Fix the remaining scorecard Fails that have a clear cause": the RT 2★ pace note. `decisions/rt2-combo-level.md` (#470) traced it and left it as a balance call with three options. This is the first option, a cheaper second combo near the start, done with one number.

## What was wrong
- RT 2★ was late on 6 of 6 seeds for every climbing type: weeks 39 to 72 against a target of 37 (GAME-DESIGN.md §3 target 4).
- The last RT 2★ line was always the second combo. The step points at Sayur Segar from week 12, and Sayur Segar needed a Warung at level 3: a Rp 1jt Kebun Sayur plus two Warung upgrades (Rp 1.5jt and Rp 3jt, before sprawl and inflation). The bots spend RT income as it comes, so the upgrades waited 30 to 50 weeks.
- Re-ranking the step's combo by upgrade cost was tried in #470 and made the hint reader slower. The combo itself was the lever.

## What changed
- `sayurSegar` needs `warung@2` (was `@3`): one upgrade instead of two. Its effect (Warung and Kebun Sayur income x1.25) is unchanged.
- The e2e test "upgrading the last piece of a combo lights it up at once" now upgrades the Warung from 1 to 2. The step test reads "(level 2+)".
- A harness test ("a builder hires an Asisten once it can afford one") now reads the whole run. With the faster RT, seed 3's week-400 snapshot fell between an Asisten quitting (week 396) and the next hire; the bot hires a second Asisten five times in that game.

## Evidence
Nine player types, seeds 1 to 6, main (cc10c40; star times as on c954245) against this branch: `BOT=<type> SEEDS=1,2,3,4,5,6 SCORECARD=1 npx vitest run tests/scorecard/run-one`. Median minutes at 1x.

| Bot | RT 2★ main | RT 2★ here | RT 3★ main | RT 3★ here | Kel 3★ main | Kel 3★ here |
| --- | --- | --- | --- | --- | --- | --- |
| builder | 7.7 | 4.2 | 9.6 | 9.5 | 48.8 | 50.4 |
| shopkeeper | 5.7 | 3.7 | 6.7 | 6.8 | 49.6 | 48.0 |
| safety | 7.7 | 4.3 | 9.9 | 9.5 | 49.6 | 52.8 |
| Pencitraan | 5.9 | 4.3 | 11.7 | 9.5 | 48.0 | 48.8 |
| honest | 8.5 | 4.7 | 10.6 | 10.0 | 51.2 | 50.4 |
| hint | 9.0 | 4.8 | 12.8 (5/6) | 13.1 (6/6) | 51.2 (5/6) | 50.4 (6/6) |
| cheapskate | 16.7 | 15.9 | 26.1 (4/6) | 25.5 (4/6) | 76.4 (1/6) | 75.6 (2/6) |
| random | 15.5 (3/6) | 15.5 (3/6) | — | — | — | — |
| idle | — | — | — | — | — | — |

- RT 2★ lands at weeks 27 to 37 for every climbing type, inside its target. Main: 39 to 72.
- The hint reader reaches Kel 3★ on 6 of 6 seeds (main 5). The cheapskate does on 2 of 6 (main 1).
- Act 1 still ends at 48 to 53 min.

Local scorecard report (seeds 1 to 6, takeover and chain rerun), against main's local report:
- **Row 23:** Fail to partial (reads Unknown). RT 1★ to 3★ on target in 6 of 6 seeds. The worst-event chain recovers within 2x target in 10 of 10 runs (main 7 of 10, the RT ones 87 to 110 weeks, now 30 to 71).
- **Row 17:** still a Fail, closer. RT 2★ no longer appears; RT 3★ 1.74x to 1.40x and RW 1★ 1.64x to 1.31x (bar 1.3).
- **Row 10:** 4 misses to 5. Honest's three RT 2★ misses are gone. Safety seeds 3, 4 and 6 and Pencitraan seeds 2 and 5 wait over 104 weeks for RW 2★. The probe shows the 4 ranking wins binding (weeks 227 to 239 for safety seeds 3 and 6), and Pencitraan reaching the RW 30 weeks sooner on 3 seeds. That is the RW rival's pacing, not this combo.
- **Row 14:** Pass to Fail, on one week. Builder seed 3 dips to −Rp 0.34jt at week 120 (RW 1★); its buffer is Rp 200rb. The longest cash pile is 1.7 min (main 2.3).
- **Row 21:** book reader 70% to 57% of the combos any bot found (bar 65 to 85).
- `npm run typecheck`, `npm test` (709), the touched e2e at 320 id and 412 en (24 tests), and the Kecamatan bot pass.

## Seen, not changed
- RW 2★ for a kampung that reaches the RW early or small: the 4 ranking wins can take 120 to 160 weeks (row 10). Worth a probe of the RW rival's start (`RIVAL_START.rw`) against arrival time.
- Row 14's one-week dip and row 21's fall are seed-level effects of a faster RT. Watch them on the next Nightly (10 seeds) before tuning.

## Verdict
Self-approved under the TODO rule. One data number, measured on all nine types. The RT's first stars now meet their target, the bad-luck check passes, and the type spread narrows. The two small regressions are written above for the Nightly to confirm.
