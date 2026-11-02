# One isometric world: volcanoes on the island, open sea, no sky

2026-11-02. Playtest feedback: the painted twin mountains and the sun between them did not match the isometric map, the back two edges of the island ended in a straight cut into the sea, and the few sea islands all looked alike.

Three options were rendered side by side (volcanoes in the island's terrain mesh; no horizon, open sea; or the backdrop kept but redrawn in 2:1 facets). The owner chose a mix of the first two.

- **No horizon, no sky.** An isometric view has no vanishing point, so the sea now runs past every edge of the world and the whole island shows as one diorama block. The golden-hour sky, cloud banks, horizon tree line and far-island silhouettes are gone.
- **Volcanoes are terrain.** The twin volcanoes rise from the island's back corner as part of the hills' corner-height mesh (`VOLCS` in `src/render/scenery.ts`). They take the same facet light, tile grid line and coloured borders as the hills, with a new `abu` (ash) material on the cap above hutan and tanah. Trees keep off their steep faces, and a tree that would stand behind a slope is left out, because trees draw after the baked world and would show through it.
- **The sun is removed.** With no sky there is nowhere for it to stand; the key light from the top left stays in the cel shading and god rays. The sun's face, its halo and its bob-and-blink loop go with it. ART.md no longer lists the sun as the face that earns the joke.
- **Back coast.** The back two edges get the same ragged beach, foam and shallows as the front coast, and the hills ease down to it.
- **Islands.** 15 to 18 islands (capped, so the Kecamatan map does not fill with them) in four size bands, from rocks to big hilly islands. Each is a small corner-height mesh on half-tile facets, painted with the ground's own materials and borders, ringed with foam, with a wet-sand bank on the near side and the map's own trees. No perspective shrink and no haze, since the projection has none.
- **No aerial perspective.** The far-land haze, the hill-silhouette fray and the far tree clumps and hamlets are removed. Clouds are the only dithered thing left.
- World build time is unchanged or a little faster (measured at RW, Kelurahan and Kecamatan sizes): the sea is filled only where no ground lies, and islands share one rank buffer.

Docs updated: ART.md (geometry, outlines, palette, scenery table, rules, lighting layers, motion, faces, terraced hills) and GAME-DESIGN.md section 6 art lines.
