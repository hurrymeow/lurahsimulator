# The Kampung Sebelah step, and why the hint reader slowed down

Two TODO items from `decisions/playtest-rt3-kel1.md`, done together because both touch `nextStep`.

## The Kampung Sebelah stars goal names no next step
"Bring Kampung Sebelah to N★" sent the player to Menu, Neighbours to find what it needs. The goal list named no build, and the playtest sat on this goal for 76 weeks.

Kampung Sebelah's stars use the RT star goals (residents, combos, Popularitas; the ranking goals are the player's own). Its residents are the player's warga in proportion to its beds. While a `sebelahAtStars` goal is open, `nextStep` now names its first unmet goal:
- short of residents: "build Rumah in Kampung Sebelah" (ID "bangun Rumah di Kampung Sebelah");
- otherwise that goal's own short line after "Kampung Sebelah: ".

The step leads the goal pill, like the RW combo step. Unit test in `tests/nextstep.test.ts`.

## The hint reader was slower because of a bot bug
#323 gave the open RW combo goal a step of kind `combo`. The hint reader bot (`tests/scorecard/driver.ts`) treats any `combo` step as the RT combo hint and builds `easiestCombo`, the cheapest RT combo. So at the RW it started buying RT combo pieces that no goal needed. That cost it 0.4 to 0.8 min from RW 2★ on. The RW combo step now has its own kind, `rwCombo`, so the bot's RT combo rule no longer fires on it. The bot already builds RW combo pieces from the RW combo goal.

## Player types, main against this branch
Median minutes at 1x to each star, with the seeds that reached it out of 6. Same command as `decisions/playtest-rt3-kel1.md`.

| Bot | RT3 main | RT3 here | RW1 main | RW1 here | RW2 main | RW2 here | RW3 main | RW3 here | Kel1 main | Kel1 here |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| idle | — | — | — | — | — | — | — | — | — | — |
| builder | 13.4m (6/6) | 13.4m (6/6) | 14.2m (6/6) | 14.2m (6/6) | 19.2m (6/6) | 19.2m (6/6) | 21.2m (6/6) | 21.2m (6/6) | 27.9m (6/6) | 27.9m (6/6) |
| shopkeeper | 13.5m (6/6) | 13.5m (6/6) | 14.3m (6/6) | 14.3m (6/6) | 19.2m (6/6) | 19.2m (6/6) | 20.6m (6/6) | 20.6m (6/6) | 27.3m (6/6) | 27.3m (6/6) |
| safety | 13.7m (6/6) | 13.7m (6/6) | 14.5m (6/6) | 14.5m (6/6) | 19.2m (6/6) | 19.2m (6/6) | 21.5m (6/6) | 21.5m (6/6) | 28.2m (6/6) | 28.2m (6/6) |
| cheapskate | — | — | — | — | — | — | — | — | — | — |
| pencitraan | 13.7m (2/6) | 13.7m (2/6) | 14.5m (2/6) | 14.5m (2/6) | 19.2m (2/6) | 19.2m (2/6) | 21.3m (2/6) | 21.3m (2/6) | 28.0m (2/6) | 28.0m (2/6) |
| honest | 13.2m (6/6) | 13.2m (6/6) | 14.0m (6/6) | 14.0m (6/6) | 19.2m (6/6) | 19.2m (6/6) | 21.3m (6/6) | 21.3m (6/6) | 27.9m (6/6) | 27.9m (6/6) |
| random | 13.5m (5/6) | 13.5m (5/6) | 14.3m (5/6) | 14.3m (5/6) | 19.7m (3/6) | 19.7m (3/6) | 34.9m (2/6) | 34.9m (2/6) | 42.0m (2/6) | 42.0m (2/6) |
| hint | 14.6m (6/6) | 14.6m (6/6) | 15.4m (6/6) | 15.4m (6/6) | 23.8m (6/6) | 23.3m (6/6) | 25.1m (6/6) | 24.5m (6/6) | 31.9m (6/6) | 31.1m (6/6) |


- **The hint reader** is back to its pace before #323 (Kelurahan 1★ in 31.1 min). It is still the slowest type: 1.21x the builder at RW 2★ and 1.11x at Kelurahan 1★. That gap was there before #323. The TODO item stays open for it.
- **Every other type** is unchanged. No bot reads the Kampung Sebelah step, so it changes no bot numbers. It is a screen fix.

## Verdict
Self-approved under the TODO rule. UI.md item 24 ("Every goal says how") now holds for the Kampung Sebelah stars goal. GAME-DESIGN.md §8 row 1 ("Always a useful next move") is better served. TESTING.md: a unit test for the step, and the nine player types are compared against main above.
