# Ground painted per corner, after Terrain3D

Asked by the maintainer: study [Terrain3D](https://github.com/TokisanGames/Terrain3D) (Godot) and bring its terrain system into the game, keeping the pixel-art look. ART.md was updated in the same PR (maintainer chose "update the doc").

## What we took, and how it maps to 2D pixel art

| Terrain3D | Pak Pejabat |
| --- | --- |
| Heightmap, one height per vertex | Already there: `cornerHeight`, lit triangle facets. Unchanged. |
| Control map: a uint32 per vertex, base id (5 bits), overlay id (5), blend (8), autoshader (1) | `encodeControl` in `src/render/terrain.ts`, same bit layout. One word per tile corner (`controlAt`). |
| Index-map shader: 4 surrounding vertices, bilinear weights, height-blended per texture | `pickMaterial`: the same weights and a height texture per material, but the top score wins the whole pixel instead of mixing colours. Pixel art cannot blend: a mix would add off-palette colours and soft edges. Sharpness at its maximum is the honest port. |
| Texture height (albedo alpha) | `materialHeight`: built from the same clumps and specks that paint the material, so the detail you see is what pushes through. |
| Autoshader from slope | Bare earth (`tanah`) shows through kebun, teh and teras on corners steeper than 8 px, fully at 14. |
| Macro variation from a noise texture | Two noises baked per corner, read bilinearly. They shift the flat-tone choice, never the colour. |

Not taken: clipmap LOD, regions, collision, holes, navigation bits, foliage instancer, detiling, UV rotation and scale. The map is one cached canvas at art resolution, so none of them buys anything here.

## Mountains and the sea (follow-up in the same PR)

Asked by the maintainer: blend the mountains too, and add islands so the horizon is not one straight line.

- The volcanoes are painted in three altitude zones (ash cap, rock, forest) that meet through `heightBlend`, the field form of the same height-blended pick. Forest climbs the ravines, rock runs down the ridges. The haze at the feet now starts lower, so the forest feet join the far tree line and the hills instead of floating behind them.
- The far tree line stays only in front of the mountains. Past them it breaks into far islands (`farIsland`) with open sea between, so the horizon has gaps and bumps.
- Up to seven small islands sit on the open sea (`seaIslands`), placed by hash only where every pixel round them is open sea, so they never touch the kampung, beach or each other. They use the ground's height-blended pick for sand, grass and forest. They are painted into the cached world canvas, so they cost nothing per frame and are not tappable.

## Rules kept

- The kampung and the ring road stay tile-exact (`exact`). Plots, the faint tile checker and the road must read for placement and taps.
- No dither on near ground. Borders are decided per pixel, so they stay crisp.
- Terrain borders keep the coloured edge and rim pass; it now runs on the per-pixel winner.
- Trees read the material at their tile's centre, so none stands on sea or bare earth. Wave splashes follow the new coastline.

## Cost

`buildWorld` runs once per map size and is cached. Uniform tiles skip the pick, and macro variation is a baked lookup. About +13% build time on the Kelurahan map in local runs (about 1.37 s to 1.55 s headless). No per-frame cost.
