# Seams between RTs, and RW buildings inside the RT

## The RT looked smaller after promotion (Hari, 2026-10-29)

- Cause: the map was tiled edge to edge by 13x17 RT cells, and the two-tile seam was each cell's last row and column plus the next cell's first. On promotion the player's RT lost column 12 and row 16 to a dirt band, and anything built there stood on the road. The camera zoom did not change.
- Fix: the seams now sit between cells. A cell's pitch is 15x19 (`CELL_W`, `CELL_H`, `SEAM` in `src/sim/types.ts`), so the RW map is 28x36 and the Kelurahan 58x74. Every RT, the player's and the AI's, keeps its full 13x17.
- Saves: RW and Kelurahan saves without `gapped` are moved on load (`ungapTile` in `src/sim/area.ts`). A tile inside a cell keeps its place in the cell; a tile on an old seam goes to the matching tile of the new seam band. RT-stage saves need no move.

## RW and Kelurahan buildings inside the RT (Hari, 2026-10-29)

- RW buildings may stand on the player's RT lots (their own and taken-over RTs) or the RW seams. Kelurahan buildings on the player's RT lots or the Kelurahan seams. Neither goes on the other's seam, and RT buildings still never go on a seam.
- They still need no road, as on the seams.
