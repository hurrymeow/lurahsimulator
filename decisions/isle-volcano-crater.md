# Sea-island volcano crater (Kawah Ijen)

Date: 2026-11-06. Asked by the player: the small volcano on the sea island should have a crater, after Kawah Ijen in East Java.

## What changed
- The small volcano on big sea islands (`kind: 'gunung'` in `isoIslands`, `src/render/scenery.ts`) is now a truncated cone. Its flanks keep the concave profile (steeper exponent, 2.6, so the footprint stays close to the old peak's) up to a rim at 0.22 of the island's half-size, then a steep bowl drops 12px to a flat lake.
- Crater materials are island-only (`IsleMat`: `kawah`, `belerang`), painted by `craterColour`, so the shared `Terrain` set and the main island's blend stay as they were.
  - Kawah: milky turquoise acid lake, flat and unlit, with pale streaks.
  - Belerang: yellow sulphur crust in patches round the shore and a few streaks up the walls. The rest of the inner wall is the ash material.
- Volcano islands use quarter-tile facets (others keep half-tile), so the rim and bowl are not blocky.
- ART.md "Sea islands" row updated to match.

## Why
- Kawah Ijen is the best-known Javanese crater: a wide turquoise acid lake in grey walls with yellow sulphur at the shore. It reads at this size and adds a local landmark.
- The twin volcanoes on the main island keep their small summit dip. The request named only the small island volcano.

## Self-review
- GAME-DESIGN.md §8: no mechanic or pacing change.
- UI.md checklist: no UI change. Screenshot baselines change only if the island is in frame. If they diff, refresh them with Actions > Update baselines, since this is an intended change.
