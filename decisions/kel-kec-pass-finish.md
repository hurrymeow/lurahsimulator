# Kelurahan and Kecamatan sprite pass: the rest (2026-11-09)

Closes the TODO item "Finish the Kelurahan and Kecamatan sprite pass (follow-up to #383)", with Julian's review of #395 on top.

- **Taman level 3:** two trees were bunched on the right and the gazebo stood close to them. Now each quarter of the lot holds one thing: trees at the back, right and left at level 2; at level 3 the gazebo takes the back quarter where the big tree stood; the flower bed stays in front, the bench moves a step back from the left tree.
- **Overlap check:** every level of Balai RW, Posyandu, Portal, Pasar Kaget, Gapura, Taman, Taman Kota, Pasar, Terminal, RSUD, Kantor Kelurahan, Kantor Kecamatan, Pos Satpol PP, Koperasi Simpan Pinjam and BLK rendered at 3x and 6x with silhouettes. No part of one sprite drawn over another; nothing else to fix.
- **Detail:** Aspal Ulang was a bare road; it now shows the job half done, fresh black asphalt with a small road roller on it, the old grey road with its worn lines, and cones along the join. Baliho gets a ladder up its left leg and rolled spanduk at its foot from level 2, and a tukang pasang on the level 3 catwalk. Studi Banding was redrawn as a Bus Pariwisata in #390 after the item was written, so it needs nothing more.
- **Plate font:** the item asked for readable plate letters; #395 replaced lettered names with pictograms instead (`decisions/icons-not-words.md`), so the glyph tuning is dropped.
- **Lele:** the fish swim 1px higher at level 1, on the water of the tub #395 lifted.

Checked: `tests/art.test.ts` and `tests/footprint-art.test.ts` pass; renders before and after.

Updates the docs: ART.md, Building levels (Taman, Baliho, Aspal Ulang).
