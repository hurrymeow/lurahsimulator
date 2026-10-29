# AI RTs build more kinds, and show their ranking

Hari's TODO items, 2026-10-29: "Let AI RTs build many more kinds of building" (high priority) and "Explain how another RT wins the yearly competition".

- **Lists:** each trait has 11 to 13 one-tile buildings, with no 2x2, because the AI's lot logic is per tile. Rajin leans to shops and services, Hobi Wacana to social spots and greenery, Jarang Muncul to a bit of everything. Each is unlocked by the RT's own stars, read from the player's unlock rule. Problem unlocks (Biopori, Kebun Sayur, Pos Satpam) are open to the AI from the start, because AI RTs have no problems of their own.
- **Order:** the kind it has least of comes first, so every kind appears before any repeats. Before that rule, the missing partner of a level-1 combo the RT has half built and not found comes first. Placement then prefers a spot where the piece completes a new combo.
- **Result (bot, Auto-dana 6, 10 years, 6 seeds per trait):** every run reaches 3★ and finds 4 to 7 combos. Before, a Rajin RT found 1. Combos still count across RTs (#145). This makes AI lots look varied and makes their own combos real.
- **Level-gated combos** (Rumah Makan level 2 or 3) are skipped: the AI never upgrades.
- **Ranking line:** score now against `rivalTarget(next year)`, the months until the ranking, and wins so far, plus the score's parts. It is shown in red while below the target. A help line says what raises it.
