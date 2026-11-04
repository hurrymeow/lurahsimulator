# Pixel font: a 2 that reads as a 2, and a 5 that reads as a 5

From the TODO item "UI from the SK 2 playtest" (`decisions/playtest-sk2.md`): the pixel font's "2" reads like a Z.

- Pixelify Sans curls the 2 back at the foot, so it reads as a Z or an S on the HUD ("T2" as "TZ"). `scripts/patch-pixel-font.py` now redraws it on the font's own 5x7 pixel grid as a plain pixel 2: a round top, a diagonal, and a full bottom bar.
- The 5 had the same problem. With a round top, "2045" on the 2045 meter read as "204S". It now has a flat top and a square shoulder.
- The bold weight uses the same pixels, each grown by 18 font units a side. That is how much wider its stems are than the regular ones. Advance widths and side bearings are unchanged, so no layout moves.
- Both glyphs are built from pixel squares (overlapping contours, non-zero fill), so a later digit fix only needs a new 7-line grid.

Checked by eye at 16 and 32px in both weights beside Z and S. `tests/font.test.ts` checks that the script redraws both. The screenshot baselines that show digits change.
