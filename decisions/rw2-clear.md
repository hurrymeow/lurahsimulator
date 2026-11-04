# The path to RW 2★, and why the checklists let it pass

TODO item "Make the path to RW 2★ clear, and find why the pacing and UI checklists let it pass" (Hari, 2026-11-01).

## Why it passed
- GAME-DESIGN.md §8 judges the sim with bots, and bots reach stars without reading the screen.
- The UI audit measured words, clipping and buttons, not whether a goal can be acted on.
- Nothing asked "can a new player name the next action for this star from the screen alone?"

## What now answers it
RW 2★ asks for Kampung Sebelah at 1★, one yearly area ranking win, and one RW combo. Since 2026-11-04, each goal has a lever the player can see and use:
- **Kampung Sebelah:** the opened goal list says "How: in Menu, Neighbours, give Kampung Sebelah Dana or a Kunjungan, or build on its lots." All three levers exist now (#297).
  - The map's nameplate shows which RT that is: "Kampung Sebelah · AI".
  - Its row in Neighbours names the one blocking goal.
- **Ranking:** the line names what the score is made of: residents, working buildings, combos and Popularitas (#292).
- **RW combo:** the line points to Build, Combo.
- The ranking star goal is gone from AI RTs (#259), so no goal asks the player to make a neighbour win a ranking.

## The checklist item
UI.md Part 2 gains item 24, "Every goal says how":
- T1: `tests/goal-how.test.ts`, with `GOAL_HOW` typed, so a new goal kind cannot compile without a how-to line.
- T2: the goal e2e test.
- T3: a screenshot-only read of each stage's 1★ goal list.

GAME-DESIGN.md §8 is left as it is. Its rows are bot-scored, and this check is a UI one.

Verdict: self-approved. `tests/goal-how.test.ts` passes with the new lines in both languages, each 20 words or fewer.
