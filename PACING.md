# Pacing and balance targets

Approved by Hari, 2026-10-27. Times are real seconds at 1x. One month is 8s (`MONTH_MS`), so 15 min is about 112 months.
Measure with the test bot in `tests/balance.test.ts` (10 seeds, idle and builder). A bot never hesitates, so its times are lower bounds. A bot miss is a real miss. A bot pass is unproven.

## Targets

| # | Target | Why | Status 2026-10-27 |
| --- | --- | --- | --- |
| 1 | First house built within 30s of New Game | Kairosoft opens on a build. Idle time here loses the player. | Needs a browser run |
| 2 | First resident within 10s of the house | The first build must visibly pay off. | Pass: month 1 (8s) |
| 3 | First popup between 45s and 90s | Let the player learn the map first. | Pass: 48 to 56s |
| 4 | 1★ within 2 min, 2★ within 5 min, 3★ within 10 min | A goal done, a new one in view. | Pass in 10 of 10 bot seeds (1★ month 9, 2★ months 23 to 30, 3★ months 32 to 43). Enforced by `tests/balance.test.ts`. |
| 5 | Something new (resident, event, combo or unlock) at least every 30s | Replaces "something new every 1-2 in-game minutes". | Pass by bot, not asserted. Combos alone can go 30 months apart (seed 8), residents and events fill the gap. |
| 6 | At most 2 popups per minute, never two within 20s | Back-to-back cards read as spam. | Pass: random popups keep 3 months clear of any other event (`EVENT_CLEAR`). Asserted in `tests/balance.test.ts`. |
| 7 | Tutorial tips at least 60s apart | One lesson at a time. | Pass (`GAP_MS`) |
| 8 | No debt or soft-lock in year 1 | Bad choices slow you down. They never end the game. | Pass (balance test) |
| 9 | Year-1 cash never below 0 for idle or builder bots | Same rule, measured as a number. | Pass (balance test) |
| 10 | Each star unlocks something the player can use within 30s | Stars must feel like rewards, not counters. | Not measured |

## Sources

- Dungeon Village star gates tie to popularity, income and events held: [Kairosoft wiki](https://kairosoft.fandom.com/wiki/Dungeon_Village).
- Pocket Academy reviewers cite a weak tutorial, debt traps and no fast speed: [Pocket Gamer](https://www.pocketgamer.com/googleplay/net.kairosoft.android.school2_en).
- FTUE: get players playing fast, end each session with a goal done and a new one in view: [GameAnalytics](https://gameanalytics.com/?p=4403), [Adinmo](https://adinmo.com/first-time-user-experience-why-it-matters-and-how-to-get-it-right/page/6).
- The published sources give no numbers. The numeric targets are first-principles proposals and may be tuned. Log any change in `decisions/`.

## Known caveats

- Popups auto-pause the game, so wall time per popup is longer than the sim suggests.
- The 20s popup gap is a taste call. Loosen it if testers prefer 30s.

## Open work (not shipped here)

- Targets 4 and 6 are fixed and tested. The earlier seed 2 stall came from an unlucky event order, not a balance gap.
- Browser run for targets 1 and 10.
