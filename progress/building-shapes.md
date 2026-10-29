# Building shapes and ladder

- Sim: `sizeFor`, `sizeOf`, `Placed`; covers, tilesOf, buildingAt, neighbours, withinEdges, pathMult, ring and emptyTiles on w x h. `place`, `checkPlace`, `checkMove`, `moveBuilding` take a facing; `checkRotate` and `rotateBuilding(s, b)`.
- Data: sizes, ladder prices, Kos-kosan 8 beds, Lapangan rent and Popularitas, Terminal 3x3 with a boost.
- AI: whole-footprint spots (`fitAt`).
- Save: `growBuildings` fits, turns or keeps small.
- Render: Painter offsets and long canvases, `LONG_ART`, `groundLong`; map draws by `Shape`.
- UI: placement uses the facing in hand (Rotate re-marks free spots); inspector Rotate lists what blocks it; Build shows w×h.
- Tests: `tests/shapes.test.ts`; footprint, combo and edge tests updated.
