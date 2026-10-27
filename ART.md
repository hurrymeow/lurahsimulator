# Art direction

How Pak Pejabat looks, and how to keep new art in that look. Follow this for every sprite, scenery
change and effect. [DESIGN.md](DESIGN.md) still rules on UI, legibility and accessibility.

## The look in one line

A warm, lamp-lit diorama of a kampung: a party game's bold outlines and cheeky faces, painted in
a storybook palette, lit like an HD-2D village.

Each reference is used for one thing:

| Reference | What we take | What we leave |
| --- | --- | --- |
| Bishi Bashi Special | Bold outlines, flat cel shading, cheeky faces (the sun), bouncy timing | Wonky, hand-wobbled shapes. They clutter a busy map. |
| Warm isometric illustration (kitchen diorama) | Terracotta, mustard, teal, cream and olive. Dark brown ink, not black. Cosy clutter on the edges. | Paper grain and noisy texture |
| Octopath Traveler (HD-2D) | Golden key light, god rays, deep vignette, tilt-shift blur, dust motes, contact shadows, blue sky with soft clouds, terraced land | Photoreal bloom, heavy blur over playable tiles |
| Stylised autumn arena (3D top-down) | Painted ground clumps, scattered fallen leaves, soft value steps on the floor | 3D shapes and perspective |
| Pokemon HGSS / DPPt overworld | Coloured outlines (a dark shade of each fill, never black), small character detail, light rims and foam on terrain edges, rain | Its top-down camera and tile grid |

No third-party art or names. Everything is drawn in code.

## Scale and grid (fixed)

- Ground tile: 32x16 art pixels, a 2:1 diamond. `TW`, `TH` in `src/render/iso.ts`.
- Headroom above a tile: 40 art pixels (`TOP`). Nothing may draw higher.
- The view scales art by a whole number only (2x minimum on phones). Never draw at a fractional
  scale, except the one-pixel stretch in bounce animations.
- One art pixel is the smallest unit. No half pixels, no anti-aliased edges in sprites.

## Geometry

- Straight lines and true isometric angles (2:1) everywhere: boxes, hipped roofs, ground
  decals, terrain borders, mountain ridges, rays.
- Round shapes are allowed only where nature is round: leaf clumps, the sun, flowers.
- Build buildings from `Painter.box` and `Painter.roof`. Reach for a custom shape only when a box
  cannot say it.
- Trees are sturdy: trunks at least 4 art pixels wide, crowns made of 2 or 3 overlapping clumps
  or at least 3-pixel-thick fronds (`Painter.leaf`). No 1-pixel stems.

## Outlines

- Outlines are coloured, never a flat ink and never pure black. Every sprite gets a 1-pixel
  outline round its silhouette, and each outline pixel is a 0.45x shade of the fill it touches
  (the fill below first, then the sides, then above). A red roof gets a deep red edge, a bush a
  dark green one. `Painter.finish` does this.
- A line also runs wherever two faces, roof planes or clumps meet, in a 0.55x shade of the pixel's
  own colour, so each form reads as one clean shape. Details painted inside a face (windows,
  stripes, doors) share the face's id and get no line.
- `INK` (`#2a1810`, a dark warm brown) is left for small dark features only: eyes, the sun's
  face, contact shadows.
- The sun's rim is a deep amber, `#8a4f12`. Selokan banks are a dark warm grey, `#4a4a44`.
- Set `p.bare = true` to skip the ink pass for flat or lattice art: selokan (it draws its own
  banks so neighbours join up), grass tufts, bamboo scaffolding.
- Big buildings (2x2, 3x3) are drawn at their own size, not scaled up. `new Painter(n)` takes the
  same one-tile coordinates and rasterises every edge, diagonal and outline natively, so a 3x3's
  roofline is a smooth 1px 2:1 line like a warung's, never a scaled stair step. Paint callbacks get
  one-tile rows and columns, so windows and courses keep their proportions. Never stretch a
  finished sprite: its outline comes out n pixels thick and its diagonals scallop.
- Borders that must stay thin take `px` from `ground()`: one canvas pixel in a or b. Write a kerb
  or a bund as `e < 2 * px`, not as a fraction, so it is two pixels on any lot.
- Edges of flat pieces: the ink pass's 1px coloured line, then a light kerb inside it where it
  helps. A standalone flat piece (lapangan, taman, kolam, embung) also gets `dither`: a
  half-transparent checker of its edge colour on the grass just outside, so it settles into the
  ground. Pieces that tile (jalan, selokan, sawah) skip it, or they would bleed onto neighbours.
- Fine 1px detail that must not be outlined (fences, chalk, lamps) goes in `p.overlay`, which runs
  after the ink pass in native pixels.
- Terrain borders are coloured, not inked. The higher ground takes a dark edge in its own
  colour (0.6x). The lower side gets a bright rim that eases back to its base colour over three
  pixels (1.2x, 1.11x, 1.05x). Sea meeting sand gets foam, then lighter shallows. Rank, high to
  low: hutan, kebun, grass, sawah, road, cliff, beach, sea.
- Walkers and falling leaves get a coloured 1-pixel outline: each outline pixel is a 0.45x shade
  of the fill it touches (the fill below first, then the sides, then above). Eyes, shoes and
  tyres are already dark and keep their own colour.

## Characters

- Walkers are 7x10 art pixels and ojol riders 11x9. Keep that scale.
- Walkers have two-tone hair with a shine (one of five hair colours per resident), dark eyes, a
  shaded chin, a collar, a shirt with a shaded right side, a belt, trousers shaded on one leg,
  and shoes. Ojol riders have a helmet with a shine and visor, a bike with shaded ends and a
  headlight.
- Shirt colour still carries the job. Shading is derived from it, never a new hue.

## Shading

- Flat, two-tone cel shading on every form. No dithering.
- Texture lives inside the cel tones, in a few flat painted steps, never as random noise:
  - Roofs: tile courses every third row (lip 0.86x, crest 1.06x) with staggered joints.
  - Plain walls and trunks: a faint plank or bark line every third row (0.93x).
  - Leaf clumps: small bright sprigs on the lit side and dark gaps in the shade.
- Light comes from the top left. The left face is the base colour, the right face is 0.72x and
  the top is 1.18x (`FACE_SHADE`).
- Leaf clumps: a lit cap in the top left (1.3x), base, and a shaded rim in the bottom right (0.72x).
- Fronds and leaves: a lighter top stroke over a 0.72x underside.

## Palette

Sprite keys live in `PALETTE` in `src/render/sprites.ts`. Use a key, not a new hex, wherever one fits.

| Key | Hex | Use |
| --- | --- | --- |
| `k` | `#2a1810` | Ink, doors, dark details |
| `w` | `#f6ecd4` | Cream walls, signs |
| `t` | `#eac58f` | Plaster, skin-tone wood |
| `r` / `R` | `#df4a2c` / `#a8321f` | Terracotta roofs, awnings, flag |
| `o` | `#e57d2e` | Orange roofs, tukang parkir vest |
| `y` / `a` | `#f4b935` / `#f2b43a` | Mustard accents, bamboo, sun |
| `n` / `N` | `#a8652f` / `#603620` | Wood, trunks |
| `g` / `G` | `#86b84c` / `#527f34` | Leaves (light, dark) |
| `b` / `B` | `#3d72b4` / `#27427c` | Shop bands |
| `l` / `c` | `#82bfdc` / `#93d8cb` | Windows, glass, water |
| `p` | `#e57a9c` | Pink roofs, flowers, tongue |
| `s` / `S` | `#bdb4a3` / `#6d635a` | Warm greys, concrete, steel |

Scenery colours:

| Area | Colours |
| --- | --- |
| Grass | Clumps in `#6c8b3a`, `#78993f`, `#84a748`, `#92b553`, blade tips `#a8c768`, faint tile checker |
| Road | Packed dirt `#b87444` to `#d99a62`, pebbles `#efb878` |
| Fallen leaves | `#e57d2e`, `#f4b935`, `#df4a2c`, `#c9a14a`, scattered on grass, road and kebun |
| Cliff | Strata `#8a5a32`, `#9a6236`, `#7a4c2a`, grass lip `#5f8a3c`, foot `#5e3a22` |
| Sawah | `#9cc155` / `#86ab45` rows, ripe `#e8b440` / `#d39a32`, bunds `#8a5a32` |
| Kebun, hutan | `#5f8a3c`, `#4a7334` |
| Beach, sea | Sand `#e6c486` to `#f3daa2` with ripples, sea `#367f80` to `#4a9b96` with `#8fd0c2` wave dashes |
| Sky | Deep blue `#3f6fae` down to warm haze `#f3d9a8` at the horizon, banded in steps, 32 lighter rays |
| Clouds | Long thin streaks that taper at both ends: `#fbf8f2` top to `#c9c2d8` underside, no ink. Drawn per frame (`clouds()`): they slide slowly to and fro and twitch a pixel now and then |
| Mountains | Twin low, broad volcanoes: concave slopes, blunt crater top, `#f1f0ec` lit to `#7689ad` shade with no ridge line, faint ravines, feet melting into haze `#d6dee2`. No ink |
| Tree line | Soft rounded canopy in the horizon haze, `#88a894` / `#71927f` |
| Hills | Lit triangle facets over corner heights (`cornerHeight`), a soft grid line on each tile edge (0.86 to 0.88 shade) |
| Haze | `#ced6c4`. Far land, the hill silhouette and the mountains' feet fade into it through a 4x4 ordered dither |

Rules:

- Warm first. Cool colours (teal, blue) are accents, never the main field.
- Saturated, but not neon. If a colour glows on the dark UI, pull it toward cream or brown.
- Far things fade toward the sky colour (aerial perspective), ink included.
- Distance is the one place for dithering: haze, the hill silhouette, mountains and clouds blend
  through a 4x4 ordered (Bayer) dither in a few flat steps. Sprites and near ground never dither.
- Ground texture uses clumps squashed 2:1, so they lie flat on the isometric plane.
- The kampung is a raised block: where land meets the beach or the world's edge, a 7-pixel
  dirt cliff drops away. That gives the diorama its depth.
- UI chrome follows the console frame and its Light or Dark theme (DESIGN.md). Colour belongs to the map and to resource meaning.

## Lighting and atmosphere

Layers, from the ground up (`src/render/map.ts`, `src/render/atmosphere.ts`):

1. **Ambient occlusion.**
   - Baked: walls darken in their bottom two rows (0.78x, 0.9x).
   - On the map: a soft brown contact shadow pools under every standing building (not selokan,
     parkir or jalan).
   - Sprites also cast a flat ink shadow at 35% to the right.
2. **Sun halo.** A warm radial glow behind the sun, like light blooming through haze.
3. **Warm grade.** A gradient that is golden from the top left and warm dark toward the bottom
   right.
4. **God rays.** Five soft diagonal shafts from the top left. They dim at dusk and vanish at night.
5. **Vignette.** A deep warm-brown radial vignette, so the kampung reads as a diorama under a
   lamp. It deepens at night.

   Layers 3 to 5 are baked into one cached canvas with plain alpha, and a night version holds just
   the deeper vignette. A frame draws one full-screen blit. Never use per-frame blend modes such
   as `soft-light` or `screen` over the whole view: they cost about 8 ms a frame and fail the
   frame-rate test on slow machines.
6. **Dust motes and leaves.** 28 soft warm motes drift up and to the right by day. At night they
   become blinking green-yellow fireflies. Ten outlined leaves tumble down on the breeze.
7. **Night tint, then lit windows.** Lit windows draw above the tint.
8. **Weather.** Rain streaks, ground ripples and the shower's cool dim draw above the night tint,
   so rain still shows after dark. Shore splashes draw here too (`src/render/weather.ts`).
9. **Tilt-shift.** The top 20% of the map gets a 1.5px backdrop blur that fades out downward
   (`#dof` in `style.css`). Never blur the tiles players tap.

Badges, pops and the ghost outline draw above every lighting layer so text stays readable.

Effects off (or reduce motion) turns off layers 3 to 9. Ambient occlusion and the halo stay, so
the map still has depth.

## Motion

- Ambient loops follow **reduce motion**: the sun bobs 2 art pixels and blinks every 3.2 s, with a
  quick double blink every third time. Trees bounce in a slow wave across the map, stretching at
  most 1 art pixel from the roots. Walkers stroll.
- Particles, coins, lighting layers, motes, weather and night follow **effects**.
- Weather: a rain shower comes every 60 to 150 s (the first after 25 to 60 s), lasts 15 to 30 s
  and eases in and out over 3 s. It brings up to 80 slanted pixel streaks, ripples on the
  ground and a cool 18% dim. Waves splash on the visible shore all the time, with a foam ring
  and spray, and more often in the rain.
- Timing is bouncy, not floaty: short squashes (income, about 320 ms), quick pops (about 350 ms),
  slow ambience (sway periods of 2 s or more).
- Motion is whole-pixel. A bounce stretches by one art pixel. It never slides sub-pixel.

## Faces

Faces are where the Bishi Bashi cheek lives. Keep them simple: oval ink eyes with a one-pixel
sparkle, rosy cheeks (`#f07f86`), an open smile with a pink tongue. Blinks are happy closed
arcs (^ ^). Only give a face to things that earn the joke (the sun today). Buildings stay
faceless, so the map stays readable.

## Building levels

- Every level looks different, like a building card in a mobile builder: level 1 is makeshift,
  the top level is built to last. The silhouette and the materials change, not just the size.
  Warung: tarp-roofed gerobak, zinc-roofed kiosk, whitewashed brick with a tile roof and an awning.
  Pos ronda: bamboo balai-balai under rumbia, wooden hut, green-and-white siskamling post. Kantor RT:
  a front room with a nameboard, the office with a flag, a pendopo under a joglo roof.
- A level never grows more than one storey (8px) over level 1, and nothing but the wifi tower goes
  above 28px. A building that grows taller would hide the small ones behind it. `tests/art.test.ts`
  checks both.
- Sprites with their own level art take `level` as the third argument and are listed in `LEVELLED`.
  Every other sprite gets the upgrade kit along its front edges: a tidy wooden plank fence at level
  2, a clean stone wall with a light cap, potted plants and a lamp at level 3. It is drawn in native
  1px lines after the ink pass, so it is as fine on a 3x3 as on one tile. Ground pieces skip it.
- The inspector shows every level side by side, the current one framed.

## Roofs and walls

- Houses look like a perumahan built over the years, not one house copied. `roofShape` draws a
  limasan hip, a pelana (gable) either way round, a mono-pitch shed, or a flat dak beton with a
  parapet round a recessed deck. A rumah's variant picks roof colour, roof shape and wall colour.
- Every house has a band of roster vents under the eave and small weep holes along its base.
  Minimalis houses (shed, flat) get batu alam on the corners, and a flat roof carries a tandon.
- Gable ends and a shed's side are wall, with a small vent near the peak.
- Each shop type has its own roof, so a row of shops reads as a street.
- No roof shape rises above the hipped roof of the same house. `tests/art.test.ts` checks it.
- The bank sampah is a TPS: an open concrete bak heaped with bags, a green sign, no roof.

## Terraced hills and icons

- Behind the ring road the land rolls into real hills: each tile is two flat-lit triangles over its
  corner heights, drawn back to front, with a soft grid line along every tile edge, like an old
  train-and-city builder's map. The kampung, the ring road, the front sawah and the coast stay flat,
  so plots, taps and the beach cliff never change.
- Toward the mountains the hills carry terraces: kebun teh on the left, sawah terasering on the
  right. Each terrace is a band of the real hill height. Its riser is a lit rim over a dark line,
  steps alternate light and dark, and slopes facing the top left are lit.
- Trees stand on the hill surface. Palms and pisang keep to the low kebun by the ring road, shade
  trees gather in groves on hilltops, and steep faces stay bare so the hills read. Far tree clumps
  and three tiny hamlets sit in the haze along the hilltops.
- Menu icons sit on a cream bevelled plate, like the tool panel of an old isometric city builder.
  Panels about the kampung show a tiny scene drawn with the map's own sprites. Abstract ones show
  their glyph in dark ink with a brick-red accent.

## Adding a sprite

1. Add a function to `ART` in `src/render/iso.ts`. Start with `p.shadow(inset)`.
2. Build it from `box` and `roof` with palette keys, and paint details per face through the
   `paint` callback.
3. Keep it inside the tile's footprint and under the 40-pixel headroom. A 2x2 or 3x3 building is
   still written in one-tile coordinates: `iso(name, variant, n)` draws it natively at n.
4. Let the outline pass run, unless it is a flat decal or lattice (`p.bare = true`). Flat decals
   that tile, like selokan and jalan, draw their own edges so neighbours join up.
5. Check it at 4x on grass next to the existing sprites, then in game at day and night.
6. If it is flat (people walk over it), add it to `FLAT` in `people.ts` and `FLAT_AO` in `map.ts`.

## Checklist before merging art

- [ ] Straight isometric lines; round only where nature is round.
- [ ] 1px coloured outline (a dark shade of the fill it borders), no pure black anywhere.
- [ ] Two-tone cel shading lit from the top left. Texture in flat painted steps, not noise.
- [ ] Terrain borders use a coloured dark edge and a soft bright rim, not a black line.
- [ ] The screen edges stay the darkest part of the view (the vignette).
- [ ] Colours from the palette, warm first.
- [ ] Reads at 2x on a 320px-wide phone, by day and at night.
- [ ] Animation is whole-pixel and respects reduce motion and effects.
- [ ] `npm run e2e` passes, including the frame-rate test.
