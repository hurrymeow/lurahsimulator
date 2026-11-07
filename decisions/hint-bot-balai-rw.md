# The hint reader skipped "First build Balai RW"

## Finding
The RW combo step reads "First build Balai RW, then place side by side: Posyandu, Portal" from RW 1★ on. The hint reader bot (`tests/scorecard/driver.ts`) built only the combo pieces and never the Balai RW, so it waited for the general build order to buy it: week 177 on seed 1, against week 150 for the builder. Posyandu and Pasar Kaget need a working Balai RW, so the second RW star waited on it. That was the 66 against 45 weeks between RW 1★ and RW 2★.

It was a bot bug, not a game gap. The game names the step; the bot did not follow it.

## Change
The hint reader now builds Balai RW when the step is `rwCombo` and none stands. Nothing in `src/` changed. No game number or text changed, so GAME-DESIGN.md §8 needs no edit.

## Result (seeds 1 to 6, stars as weeks)
RW 2★: hint 144 on every seed. Builder 144 to 154. The hint reader is now level with the builder from RW 1★ to Kelurahan 1★, inside the 1.1x target of the TODO item. Seed 4 for the builder shows only 2 stars in 700 weeks in this probe; not part of this item, logged for the Fails item.
