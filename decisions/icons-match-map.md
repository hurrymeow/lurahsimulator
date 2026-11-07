# Icons draw what the map draws (2026-11-07)

Hari found a Rumah whose inspector icon (orange hip roof) did not match the house on the map (its own roof colour, shape and wall). An audit of every first-2h building at every level found the same class of bug wider:

- **Rumah:** the map picks a variant per house from its uid; every icon drew the default variant.
- **1x2 buildings** (Kos-kosan, Bengkel, Posyandu, Pasar Kaget): icons drew one tile, losing the second block, the repair bay or the yard; Posyandu level 3 showed a different building; Pasar Kaget level 1 was cut off at the tile's edge.
- **2x2, 2x3 and 3x3 buildings** (Gudang Material, PAUD, halls, Sawah, Lapangan, Kelurahan and Kecamatan offices, Terminal): icons squeezed the art onto one tile, so it came out tall and boxy instead of wide.

Fix: `buildingURL(id, scale, level, variant)` in `src/render/iso.ts` draws an icon with the map's own art call (footprint, level, variant), at a smaller whole scale for bigger lots. `houseVariant(uid)` in `src/render/sprites.ts` is shared by the map and the inspector. Build cards, the Build detail, the inspector and the lists (combos, Warga groups) use it. The How-to keeps sprite pictures that are not buildings.

ART.md, Building levels, now states the rule.
