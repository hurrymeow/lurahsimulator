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
NUMBERS

## Verdict
Self-approved under the TODO rule. UI.md item 24 ("Every goal says how") now holds for the Kampung Sebelah stars goal. GAME-DESIGN.md §8 row 1 ("Always a useful next move") is better served. TESTING.md: a unit test for the step, and the nine player types are compared against main above.
