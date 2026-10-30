# Terrain3D-style ground materials

- `src/render/terrain.ts`: control words in Terrain3D's bit layout (base, overlay, blend, auto) and `pickMaterial`, a pixel-art index-map pick with height blending.
- `src/render/scenery.ts`: a control map per tile corner outside the kampung (`controlAt`), an autoshader that bares earth on steep hill faces, baked macro variation, per-pixel material in the ground pass (`groundAt`), trees and shore splashes on the new borders.
- The coast, sawah, kebun and terraces now meet along organic lines instead of tile staircases. The kampung and ring road are unchanged.
- Mountains in altitude zones (ash, rock, forest) with height-blended borders; forest feet run into the land.
- The horizon breaks into far islands with open sea between, and small islands dot the sea.
- Golden-hour sky stepped through the dither, with cloud banks on the horizon, replaces the sunburst.
- Fixes: the sea stays level instead of taking a sloped tile's facet light (a dark wedge by the Kelurahan corner), sea islands are never shrunk to specks, and edge pixels never read a kampung tile.
- `tests/terrain.test.ts` covers the bit layout, bilinear weights, blends and the height push.
- ART.md: new Ground materials section, bare earth in the palette.
