# Footprints

- `BuildingDef.footprint` is a square N x N, default 1. Rectangles are out: sprites scale by whole numbers only (ART.md), so the 1x1 sprite drawn N times larger fills an N x N diamond exactly.
- `Building.x,y` is the top (min x, min y) tile. No save migration: every old building is 1x1.
- Tapping an empty tile while placing centres a big footprint on that tile instead of using it as the corner.
- Depth sort uses the front tile (x + y + 2(N-1)), so a big building draws over what is behind it and under what is in front.
- `BuildCategory` lives on the def now (default `facilities`) so the content thread can tag buildings before the tabs land.
- Kelurahan defs already said `footprint: 2`. That is now real, so a Kelurahan building covers four seam tiles.
