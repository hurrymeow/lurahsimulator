# Decor one by one, without leaving build mode

Owner correction (2026-11-09) to `decisions/decor-rows.md` (#399): "one by one without having to go back to main menu. Build one, confirm, another, confirm, until the player clicks Cancel. Keep the current Jalan Setapak."

## What changed
- Decor no longer goes down as a row. `buildsInLine` is paths only again, and `linePath` is back to its form before #399: paths are free and uncapped, so its kas and cap checks had no use left.
- New `keepsPlacing` (`src/sim/line.ts`): every non-path building on the Decor tab (Pohon Rindang, Balai-balai Bambu, Lampu Jalan, Mural, Patung Ikon, Taman, Biopori) stays in hand after it is placed. The ghost clears, the free spots glow again, and the bar reads "Built. Tap another spot, or ✕ to stop." / "Terpasang. Ketuk tempat lain, atau ✕ untuk selesai." The ✕ (Batal) button leaves build mode, as before.
- The row prompts from #399 are removed. Houses, shops and facilities still leave build mode once placed.
- Jalan Setapak is unchanged: first tile, last tile, Yes.

## Checks
- Unit (`tests/line.test.ts`): paths build in a line; the Decor tab keeps placing; houses, shops and paths do not.
- e2e (`tests/e2e/ui.spec.ts`, 320px id and 412px en): place a Pohon Rindang, confirm, see "Tap another spot", place a second, confirm, then ✕ returns to the main bar. Path, build-mode and tutorial specs still pass (66).

Updates GAME-DESIGN.md (the Rows line becomes Placing). Verdict: owner request.
