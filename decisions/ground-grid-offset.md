# The painted ground sat 5px off the tile grid

2026-11-03. From the owner's playtest: the jalan setapak and the buildings did not line up with the grid on the ground.

The paths, buildings, taps and walkers all stand at height 0. The world canvas paints the ground as triangles over corner heights (`cornerHeight` in `src/render/scenery.ts`), and the soft maximum that joins hills and volcanoes added ln 2 / K (about 4.6, rounded to 5px) wherever both were 0. Its correction only took that back where both were 8px or more. So every flat tile, the kampung and the ring road included, was painted 5 art pixels higher than the grid everything else used. The grass's faint tile lines ran about a third of a tile off the path edges and building plots.

The soft maximum's excess now fades out over the first 8px of height, so flat land is exactly 0 and the hills and volcanoes keep their shape. `tests/ground-level.test.ts` checks every corner of the kampung and the ring road is at height 0 at RT, RW and Kelurahan. It fails with height 5 on the old code.

No doc changes: ART.md already says the kampung keeps exact tile edges. The code now matches it.
