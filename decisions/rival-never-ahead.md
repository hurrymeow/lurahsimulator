# The rival is never ahead of the calendar; Stempel stops after the RW

TODO item "Fix the remaining scorecard Fails that have a clear cause". The check flagged after #472 (`decisions/sayur-segar-level2.md`): row 10's RW 2★ misses.

## What was wrong
- **Row 10 had 5 misses on seeds 1 to 6**, all RW 2★, over 2x the RW star gap (104 weeks): safety seeds 3, 4 and 6, and Pencitraan seeds 2 and 5.
- **Probe of each RW ranking:** these kampungs reached the RW early (week 54 to 77) and small (area score about 730). Since #376 the RW rival counts quarters in the stage from `RIVAL_START.rw` = 8, the typical arrival. So the first RW ranking always met a rival of about 1,050, whenever the player arrived. Pencitraan seed 2 lost its first 7 rankings (732 against 1,055 up to 1,532 against 1,584). Safety seed 3 lost 10. Each loss costs 5 Popularitas.
- Pencitraan seed 3, which arrived at the usual week 90 with 1,099, won from its first ranking. The rule #376 made so a late arrival is not locked out was punishing early arrivals instead.

## What changed
1. **The rival is never ahead of the calendar.** `rivalYear` takes the earlier of the calendar quarter and `RIVAL_START + quarters in the stage`. A new constant, `RIVAL_LEAD` (0), sets how far ahead the rival may run. A late arrival meets the same rival as before. An early one meets the rival of its own quarter.
   - A lead of 2 was tried: pace stayed as on main, but safety seeds 3, 4 and 6 still missed.
2. **Stempel stops after the RW.** `stempelSystem` runs in the RW only. The promotion to the Kelurahan clears the stamps with the letters, which it already cleared. A Calo's deal (Rupiah for a stamp and a little Orang Inside) runs in the RW only; his scandal risk stays.
   - Before this, stamps refilled to their cap at the Kelurahan and sat there. With the shorter RW, more of B4 falls in the Kelurahan, and row 13 read "Stempel B4 never spent".
   - GAME-DESIGN.md already says "Letters stop at the Kelurahan". Stempel is not on the HUD, so a player sees no change.
3. **Tests:**
   - `tests/rw.test.ts` checks an early arrival.
   - `tests/grow.test.ts` checks that Stempel stops at the Kelurahan. Its letter test moves from a Kelurahan state to an RW one, where letters exist.
   - `tests/kel-bot.test.ts`: the shortcut kampung, which starts the Kelurahan at week 0 and used to lose its first year, now reaches Kel 3★ at weeks 169 to 193 (was 253 to 301). Its window moves from 240–330 to 160–240. Fourteen wins take at least 168 weeks.

## Evidence
Nine player types, seeds 1 to 6, main (746ecff) against this branch. Median minutes at 1x.

| Bot | RW 2★ main | RW 2★ here | RW 3★ main | RW 3★ here | Kel 3★ main | Kel 3★ here |
| --- | --- | --- | --- | --- | --- | --- |
| builder | 21.6 | 17.8 | 28.0 | 24.1 | 50.4 | 46.4 |
| shopkeeper | 19.2 | 17.6 | 25.6 | 20.8 | 48.0 | 43.2 |
| safety | 24.9 | 20.8 | 30.4 | 24.2 | 52.8 | 47.2 |
| Pencitraan | 20.0 | 19.2 | 25.6 | 23.1 | 48.8 | 45.6 |
| honest | 23.2 | 22.7 | 27.2 | 25.5 | 50.4 | 49.6 |
| hint | 19.2 | 19.2 | 25.6 | 25.6 | 50.4 | 48.8 |
| cheapskate | 32.0 (3/6) | 32.0 (3/6) | 41.7 (3/6) | 41.7 (3/6) | 75.6 (2/6) | 75.6 (2/6) |
| random, idle | unchanged | | | | | |

- **Row 10: 5 misses to 0.**
- **RW length:** the longest drops from 28.4 to 18.0 min (safety), and the whole range is 11.7 to 19.2 min (main 12.0 to 28.4). The Kelurahan's length is about the same (21 to 24 min, main 21 to 27).
- **Act 1 ends at 43.2 to 49.6 min** (main 48.0 to 52.8). That is inside B4 (under 60) but 2 to 9 min under Hari's "near 52". The RW was already under its target of about 20 min (`decisions/stage-lengths-quarterly-wins.md`), and now more so for the fast types.
- **Slowest over fastest type at Kel 3★:** 1.15 (main 1.10).
- The Stempel change moves no star for any type: star weeks are identical with and without it.
- **Local scorecard report** (seeds 1 to 6, with the takeover and the chain): 10 Pass, 11 Fail, 6 Unknown (main: 9, 12 and 6). Row 10 goes from Fail to Pass, and row 13 stays a Pass. No other verdict changes.
- `npm run typecheck`, `npm test` (712) and the Kecamatan bot (`KEC_BOT=1 SEEDS=3,4`) pass.

## Seen, not changed
- **The RW is short.** With the early-arrival penalty gone, a fast type spends 12 to 18 min there against a target of about 20. Lengthening it is a content call (a harder RW 1★, or more RW lines), not a rival one.
- **Act 1 is a few minutes under "near 52".** Same cause.

## Verdict
Self-approved under the TODO rule. Row 10 passes for a stated cause, and row 13's Stempel reading is fixed at its root (a dead resource), not in the harness. The pace cost is written above. GAME-DESIGN.md is updated in this PR (the rival line).
