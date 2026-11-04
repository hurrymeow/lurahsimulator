# A how-to line for every goal

TODO item "Show a how-to hint for every goal when it is tapped open" (Hari, 2026-11-01: he could not tell how to win "menang peringkat tahunan wilayah 1 kali", and the "Next step" hint under it talked about Warung Sembako).

- Each of the 22 goal kinds has one line, `goal.how.<kind>`, that names the action and where to do it. It is 8 to 15 words, in EN ("How: …") and ID ("Caranya: …"). `GOAL_HOW` in `src/sim/stages.ts` is a `Record<Goal['kind'], Key>`, so a new goal kind cannot compile without its line.
- In the opened goal list, every unmet goal is a row the player can tap. Only one row shows its how-to line at a time: the first unmet goal at the start, then whichever goal was tapped last. The closed pill does not change. This keeps the list over the map short (UI.md rule 13). Hari asked for the hint in the tapped state, so it adds nothing to the closed strip.
- The lines match the goal's own condition, never the next stage's. The ranking goals name what the score is made of (residents, working buildings, combos, Popularitas). The Neighbour goals name Menu, Neighbours, Dana. The Kecamatan goals name the buildings that move pinjol and Aman.
- The Kelurahan-star goal says the other Kelurahan grow on their own. That is true today: no player lever reaches them yet ("Bantuan" is not built).
- The Stempel explainer row (`goal.stempelHelp`) stays. The new Stempel how line names the two fixes.

Verdict (self-approved): `tests/goal-how.test.ts` checks that every kind has a line in both languages, 20 words or fewer. The e2e goal test checks that the line shows, that it moves on tap, and that the list stays legible at 320 and 430px ID and 412px EN.
