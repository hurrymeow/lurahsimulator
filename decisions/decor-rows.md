# Decor goes down in rows, like Jalan Setapak

Owner request (2026-11-09): every hiasan building can be built several at a time, the way Jalan Setapak is laid.

## What changed
- `buildsInLine` (`src/sim/line.ts`): a building is placed as a row when it is a path or it sits on the Decor tab (`categoryOf`). That is Jalan Setapak, Biopori and the other path tiles, Pohon Rindang, Balai-balai Bambu, Lampu Jalan, Mural Kampung, Patung Ikon Kampung and the Kelurahan Taman. Houses, shops and facilities still take one tap per building.
- The flow is the path's: tap the first spot, tap the last (or the same one again for a single), then Yes. The row is an L, taking the bend with fewer blocked tiles. Build mode stays open afterwards for the next row, and the kas pop shows the whole row's cost.
- `linePath` now marks as buildable only what Yes will really build: no more than the kas and Orang Inside pay for, no more than a cap leaves (Patung Ikon 2, Taman 2), and for a footprint bigger than one tile (Taman, 3x3) only spots that do not overlap the one before.
- The prompts for a Decor row say "spot" and "row" instead of "tile" and "path": "Tap the first spot of the row." / "Ketuk tempat pertama barisan.", "Tap the last spot, or the same one for one." / "Ketuk tempat terakhir, atau yang sama untuk satu.", "{n} to build · {cost}" / "{n} dibangun · {cost}".

## Why this way
The path flow already exists, is tested at every width and is what the owner pointed to. A row of trees or lamps along a gang is also how a kampung decorates. Turning (the rotate button) is hidden for rows as for paths; every Decor building but Taman is 1x1, and Taman is square.

## Checks
- Unit (`tests/line.test.ts`): every Decor-tab building and path builds in a line and a Rumah does not; a row of Pohon Rindang places every free spot; the preview stops at what the kas pays for; Patung Ikon stops at its cap of 2.
- e2e (`tests/e2e/ui.spec.ts`, 320px id and 412px en): a row of Pohon Rindang from two taps and Yes builds three or more, and the preview is legible. The path, build-mode and tutorial specs still pass (88).
- Scorecard bots place through the sim, not the screen, so their numbers do not move. The nightly screen bot taps until Yes lights, which for Decor now builds a short row.

Updates GAME-DESIGN.md (Roads section, new Rows line). Verdict: owner request; UI.md checks (labels under 6 words, one primary button) hold.
