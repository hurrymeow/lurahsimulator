# Equal-width button rows and a level 2 house that fits its tile

The maintainer asked for two fixes from a phone screenshot.

## House level 2

- The old level 2 teras was a canopy on two posts that stood about 3px past the tile's front-left edge, onto the next tile.
- Now the teras is set into the front-left wall under a strip of the roof colour, with the door in its shade, a tiled floor and a pot plant. A low white pagar runs one pixel inside the tile's front edges, open in front of the door, so level 2 still reads apart from level 1 at map scale. It matches the fence the other buildings get as their upgrade kit.
- Levels 1 and 3 already fitted. A new test in `tests/art.test.ts` checks that every roof colour, roof shape and wall colour at every level keeps every solid pixel on or above the tile's front edges.
- ART.md now describes the new level 2.

## Equal-width buttons

- Rows of side-by-side buttons are grids of equal columns, so every button in a row is the same width. A long label wraps inside its button instead of making it wider. Added to UI.md rule 1.
- Covers: the Build tabs, the Combo and Warga filters, Move/Rotate in the inspector, Language and Theme in Settings, Fund and Auto-dana in Neighbours, the raise answer in Staff, Pak/Bu on the naming screen, the Lomba contest and ketua rows, and the floating Cancel/Rotate/Place bar.
- The Build tabs (four categories and Combo) do not fit one row of equal widths on a phone, so they always sit in three columns: three on top, two below, all the same width. This replaces the earlier "one row at 412px and up" layout.
- The Lomba rows can hold many buttons, so they fill equal 130px-or-wider columns row by row.
- At 320px in Indonesian, "Semua 24" on the Combo filter wraps onto two lines to keep the four filters equal.
- The Place bar's buttons have 10px side padding instead of 16px, so three equal buttons still fit at 320px.
