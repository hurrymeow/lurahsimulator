# Sprites inside their footprints: two drawing bugs, not 22 art fixes

TODO item "Keep every building sprite inside its footprint" (UI.md rule 17). Before this change, `SPILL_ALLOW` listed 31 sprites.

Most of the spills were not art. They were two bugs in the painter (`src/render/iso.ts`):

1. **Half-pixel rows.** `Painter.px` built its array index from the raw coordinates. A fractional row, such as the level-3 upgrade kit's left pot at row `fy - 5/2`, indexed the pixel array mid-row and landed the pixel half a row later. On a 64-wide 2x2 canvas that is 32 pixels to the right, below the front edge.
   - This is why every 2x2 Kelurahan and Kecamatan building spilled exactly 10px: one potted plant, drawn on the wrong side of the building.
   - It also caused the seven 1px spills, and it put other fractional props a pixel off.
   - **Fix:** `px` floors its coordinates, and the kit rounds its pot row.
2. **Long-footprint ground.** `Painter.ground` divided by `cx`, the tile's centre, which includes the painter's offset, instead of by the tile's half-width. On the second tile of a long footprint (Bengkel's car bay, Kos-kosan, Posyandu, Pasar Kaget), the ground diamond was drawn too wide. **Fix:** divide by `(TW / 2) * n`.

With both fixed, 9 sprites still spill. These are props drawn on purpose at the front edge:
- the Pos Satpam barrier arm (21px);
- the Warung crate (16px);
- the Indomaret and Alfamart front walls (14px);
- the Bidan sign (11px);
- the Kantor RT sign and the Bank Sampah sacks (8px);
- the Baliho legs (5px);
- the Portal post (3px).

Their caps in `SPILL_ALLOW` are lowered to today's counts. The TODO item stays open for those props, which need art changes one sprite at a time.

Verdict (self-approved):
- `npm test` passes (604), including `tests/art.test.ts` and `tests/footprint-art.test.ts`.
- Checked by eye on a contact sheet with each footprint outlined.
- The screenshot baselines are refreshed in CI, because sprites that used fractional coordinates move by a pixel.
