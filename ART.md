# Art direction

How Pak Pejabat looks, and how to keep new art in that look. Follow this for every sprite, scenery
change and effect. [GAME-DESIGN.md](GAME-DESIGN.md) still rules on UI, legibility and accessibility.

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
  banks so neighbours join up), grass tufts, bamboo scaffolding, the staked plot of a building
  waiting for its permit.
- Big buildings (2x2, 3x3) are drawn at their own size, not scaled up. `new Painter(n)` takes the
  same one-tile coordinates and rasterises every edge, diagonal and outline natively, so a 3x3's
  roofline is a smooth 1px 2:1 line like a warung's, never a scaled stair step. Paint callbacks get
  one-tile rows and columns, so windows and courses keep their proportions. Never stretch a
  finished sprite: its outline comes out n pixels thick and its diagonals scallop.
- Long buildings (1x2, 2x3) use `new Painter(1, fa, fb)`: a canvas for fa tiles along the map's x axis
  and fb along its y axis. Build them from one-tile pieces: `p.at(u, v)` moves every primitive onto
  tile (u, v), and pieces draw back to front (lower u + v first). `groundLong()` paints ground over the
  whole lot. Draw long art one way only, along x: a turned building is that art mirrored, which in
  this projection swaps the axes exactly. Their art lives in `LONG_ART`; a long building without its
  own entry repeats its one-tile sprite on every tile.
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
  low: hutan, kebun and teh, grass, sawah and teras, road and bare earth, cliff, beach, sea. The
  pass runs per pixel, so it follows the organic borders of the control map (see Ground materials).
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
| Sky | Golden hour: deep blue `#3f6fae` overhead, `#76a0cc`, a warm `#e2c8aa` band, gold `#f6ce94` at the horizon. Eight steps per stop, stepped through the 4x4 dither. No sunburst |
| Cloud banks | Heaps of round puffs resting on the horizon behind the mountains, in separate banks with sky between: warm cream `#fff4dc` lit top left, `#f6dcc0`, `#e8c4b4`, dusty rose `#d2b0b4` in the shade. Flat undersides melt into the gold haze through the dither. Baked, no ink |
| Clouds | Long thin streaks that taper at both ends: `#fbf8f2` top to `#c9c2d8` underside, no ink. Drawn per frame (`clouds()`): they slide slowly to and fro and twitch a pixel now and then |
| Mountains | Twin low, broad volcanoes: concave slopes, blunt crater top, faint ravines, feet melting into haze `#d6dee2`. No ink. Three altitude zones meet through the ground's height-blended pick: the ash cap `#f1f0ec` to `#7689ad`, rock `#d8d4cc` to `#6d7387`, hazy forest `#a3bfa6` to `#517463`. Forest climbs the ravines and its feet run into the tree line |
| Tree line | Soft rounded canopy in the horizon haze, `#88a894` / `#71927f`, only in front of the mountains. Past them it breaks into far islands, a few with a small cone, with open sea between, each with a pale sand line at the waterline |
| Sea islands | Up to seven small islands on the open sea, never touching land: a lumpy two-lobed oval, foam ring, sand, grass and forest by height (the beach and grass colours), a short wet-sand bank on the near edge, round tree clumps. Smaller and hazier toward the horizon |
| Hills | Lit triangle facets over corner heights (`cornerHeight`), a soft grid line on each tile edge (0.86 to 0.88 shade) |
| Bare earth | The cliff strata `#7a4c2a`, `#8a5a32`, `#9a6236`, with rare stones `#bdb4a3` and `#6d635a`. Only on steep hill faces |
| Haze | `#ced6c4`. Far land, the hill silhouette and the mountains' feet fade into it through a 4x4 ordered dither |

Rules:

- Warm first. Cool colours (teal, blue) are accents, never the main field.
- Saturated, but not neon. If a colour glows on the dark UI, pull it toward cream or brown.
- Far things fade toward the sky colour (aerial perspective), ink included.
- Distance is the one place for dithering: the sky, haze, the hill silhouette, mountains, far islands and clouds blend
  through a 4x4 ordered (Bayer) dither in a few flat steps. Sprites and near ground never dither.
- Ground texture uses clumps squashed 2:1, so they lie flat on the isometric plane.
- The kampung is a raised block: where land meets the beach or the world's edge, a 7-pixel
  dirt cliff drops away. That gives the diorama its depth.
- UI chrome follows the console frame and its Light or Dark theme (see UI chrome below). Colour belongs to the map and to resource meaning.

## UI chrome

The frame round the map is drawn in CSS (`src/ui/console.css`), not in pixel art, but it follows the
same look: flat fills, 1px rules, no gradients, no rounded corners.

| Part | Look |
| --- | --- |
| Time row | 30px tall. Play/pause and speed as two equal 44x28 square buttons with a 1px rule; play is dark green while paused. The date centred in the body font. A 1px rule, then the 2045 label, a thin track and the percentage. Under 360px wide the track drops out. |
| Money row | 30px tall. The five resources, a 16px icon and a bold number each, spread across the row. |
| Goal pill | Over the map's top-left, opposite the satellite view. Cream fill, a 1px rule and a hard 2px drop shadow. One bold line, cut with … when long; a small ▾ when it can open to the whole line and the next star. |
| Satellite view | 88x60, a 1px rule and a hard 2px drop shadow. No label. |
| Toast | Full map width, 8px from the map's bottom edge. A 4px muted bar on the left, a 1px rule and a hard 2px drop shadow. Fades over 0.4s after 3s; with reduce motion it just goes. |
| Month line | 4px across the full width, along the top edge of the bottom bar. Dark green fill on a darker cream track. |
| Dock | Three equal buttons in a grid: Build, Warga, Menu. A 24px icon over a bold label, 52px tall, square, no shadows. Build and Warga use their menu icon plates; Menu is dark green with a three-bar icon. |

| Sheets and pop-ups | Theme tokens: cream and ink in Light, Mono Dark in Dark. Square corners; in Light a 2px ink rule, sheets with a 4px ink lip on top, pop-ups with a hard 4px drop shadow. |
| Combo card | One per row, the full width of the sheet, a 1px rule (2px green when active). Top line: the name in bold on the left; on the right up to three 24px building sprites joined by + and a 24px state square (✓ green, ★ amber, ? muted). Below: the effect in two muted lines. Not-yet cards show black silhouettes. |
| Warga group | A box per job with a 1px rule; No job adds a 6px red left edge. Head: the 40px workplace sprite, "Job · count" in bold, and the group's output on the right. People are 48px chips: name, level stars under it. |
| Resource amounts | A 16px icon, a 4px gap and a bold number in the resource's colour; amounts sit 8px apart and align right. |

- Light and Dark use the same parts at the same sizes. Only the colour tokens change (GAME-DESIGN.md section 6, Themes).
- Numbers use the body font, never the pixel font.

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
- Houses grow, not just fence in. Rumah: the bungalow, then a teras canopy in the roof colour on
  two posts over the door, then a rumah tingkat with a balcony rail on the upper floor. Every roof
  shape and colour carries through all three levels. Kos-kosan is tall and narrow from level 1 (two
  floors of rooms under a pelana, a steel stair up the side), then a third floor with a flat dak, a
  tandon and a jemuran on the deck. A house's housing type reads from its silhouette: squat rumah,
  long low kontrakan, tall kos.
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
- No roof shape rises above the hipped roof of the same house at the same level. `tests/art.test.ts` checks it.
- The bank sampah is a TPS: an open concrete bak heaped with bags, a green sign, no roof.

## Ground materials

Outside the kampung and its ring road, the ground is painted per tile corner, after Terrain3D's
control map and index-map shader (`src/render/terrain.ts`, `controlAt` and `groundAt` in
`src/render/scenery.ts`). Read `decisions/terrain-control-map.md` for the mapping.

- Each corner holds one 32-bit control word in Terrain3D's layout: a base material, an overlay
  material, an 8-bit blend and an autoshader flag. A corner takes the two commonest materials of
  the tiles round it, blended by their share, with a little noise.
- A pixel weighs its four corners bilinearly and adds each material's height texture (clumps,
  pebbles, sand ridges, rock). The highest score wins the whole pixel. Colours never mix, so the
  border is organic but crisp, in the palette, with no dither and no half pixels.
- Autoshader: on hill corners steeper than 8 art pixels to a neighbour, bare earth shows through
  kebun, teh and teras, fully at 14. No tree stands on it.
- Macro variation: two low noises, baked per corner, nudge which flat tone a pixel picks, so
  grass, dirt and gardens get broad lighter and darker patches. It shifts tones and never adds a colour.
- The kampung and the ring road keep exact tile edges, so plots and the road always read. The
  coast, sawah, kebun and terraces meet along organic lines, and the beach cliff and wave
  splashes follow them.

## Terraced hills and icons

- Behind the ring road the land rolls into real hills: each tile is two flat-lit triangles over its
  corner heights, drawn back to front, with a soft grid line along every tile edge, like an old
  train-and-city builder's map. The kampung, the ring road, the front sawah and the coast stay flat,
  so plots, taps and the beach cliff never change.
- Toward the mountains the hills carry terraces: kebun teh on the left, sawah terasering on the
  right. Each terrace is a band of the real hill height. Its riser is a lit rim over a dark line,
  steps alternate light and dark, and slopes facing the top left are lit.
- Trees stand on the hill surface. Palms and pisang keep to the low kebun by the ring road, shade
  trees gather in groves on hilltops, and steep faces stay bare so the hills read. The steepest
  faces show bare earth (see Ground materials). Far tree clumps
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
- [ ] The touched e2e specs pass locally, including the frame-rate test. CI runs the full suite.
