# Art direction

How Pak Pejabat looks, and how to keep new art in that look. Follow this for every sprite, scenery
change and effect. [GAME-DESIGN.md](GAME-DESIGN.md) still rules on UI, legibility and accessibility.

## The look in one line

A warm, lamp-lit diorama of a kampung: a party game's bold outlines and cheeky faces, painted in
a storybook palette, lit like an HD-2D village.

Each reference is used for one thing:

| Reference | What we take | What we leave |
| --- | --- | --- |
| Bishi Bashi Special | Bold outlines, flat cel shading, cheeky faces, bouncy timing | Wonky, hand-wobbled shapes. They clutter a busy map. |
| Warm isometric illustration (kitchen diorama) | Terracotta, mustard, teal, cream and olive. Dark brown ink, not black. Cosy clutter on the edges. | Paper grain and noisy texture |
| Octopath Traveler (HD-2D) | Golden key light, god rays, deep vignette, tilt-shift blur, dust motes, contact shadows, soft clouds, terraced land | Photoreal bloom, heavy blur over playable tiles |
| Stylised autumn arena (3D top-down) | Painted ground clumps, scattered fallen leaves, soft value steps on the floor | 3D shapes and perspective |
| Pokemon HGSS / DPPt overworld | Coloured outlines (a dark shade of each fill, never black), small character detail, light rims and foam on terrain edges, rain | Its top-down camera and tile grid |

No third-party art or names. Everything is drawn in code. A chain's brand is told by a colour scheme
close to the real chain's, never by its logo or name (Hari, 2026-11-07): IndoApril and BetaMart.

## Hari's art preferences

Learned in the silhouette pass of 2026-11-07 (`decisions/silhouette-pass.md`). Follow them for every
building, and judge new art against them before showing it.

1. **Silhouette first.** Every building is recognisable by its outline alone, before colour. Check
   each one as a black silhouette next to its neighbours; two buildings that share an outline (Apotek
   and Fotokopi, Lampu Jalan and Patung Ikon, the Kecamatan offices) are a bug.
2. **Levels grow in shape.** Level 1 is the smallest and simplest; the top level is the biggest and
   most complex. Each level adds a mass: a wing, a porch, a second roof tier, a second storey, an open
   shed, a vehicle, a sign or a yard. A level that only changes colour or adds a fence is not enough.
3. **Like the real thing.** A building looks like its Indonesian counterpart in a kampung, pasar or
   kota: scout real references (market studies, kantor kelurahan and camat, pustu, terminal tipe C,
   baliho) before designing, and borrow their massing, not their logos.
4. **Competing chains share one shape.** Minimarkets of different chains have the same silhouette
   and differ only in colour and pattern, as the real ones share a template.
5. **Break big buildings into parts.** A 2x2 or 3x3 is several smaller masses on its lot (units in a
   row, a hall and its annex, a shop in front of a warehouse), never one box scaled up. Use
   `src/render/massing.ts`.
6. **No bubble trees.** Every tree, scenery or built, is the tiered canopy: a sturdy trunk and two or
   three stacked 2:1 discs with a shade band under each rim. Never a ball of foliage.
7. **Small life.** Moving details are welcome where they belong: fish in ponds, steam, a waving
   tukang parkir. They hold still with reduce motion.
8. **Workflow.** For a new look, show a local render first: a before and after sheet at every level
   with silhouettes, from the real art code. Hari judges it and sends notes in rounds. Once Hari says
   go, and for fixes and follow-ups, open the PR yourself with auto-merge on and see it through to
   the live build (AGENTS.md).

## Scale and grid (fixed)

- Ground tile: 32x16 art pixels, a 2:1 diamond. `TW`, `TH` in `src/render/iso.ts`.
- Headroom above a tile: 40 art pixels (`TOP`). Nothing may draw higher.
- The view scales art by a whole number only (2x minimum on phones). Never draw at a fractional
  scale, except the one-pixel stretch in bounce animations.
- One art pixel is the smallest unit. No half pixels, no anti-aliased edges in sprites.

## Geometry

- Straight lines and true isometric angles (2:1) everywhere: boxes, hipped roofs, ground
  decals, terrain borders, volcano facets, rays.
- One projection for the whole world. Nothing is a flat painted backdrop: the volcanoes, the islands
  and the sea are drawn in the same isometric view as the kampung. There is no horizon and no sky,
  since an isometric view has no vanishing point (playtest 2026-11-02: painted mountains and a sun
  between them broke the isometric feel).
- Round shapes are allowed only where nature is round: clouds, flowers, fruit, the discs of a canopy tree.
  Never a round ball of foliage for a tree.
- Build buildings from `Painter.box` and `Painter.roof`, or from `prism` and `roofRect` in
  `src/render/massing.ts` when a lot holds several masses: a box and a roof (hip, gable either way,
  shed or flat) over any rectangle of the footprint, drawn natively at any n. Reach for a custom shape
  only when neither can say it.
- Trees are sturdy: trunks at least 4 art pixels wide, crowns made of 2 or 3 stacked canopy tiers
  (`canopyTree` in `kampung-art.ts`) or at least 3-pixel-thick fronds (`Painter.leaf`). No 1-pixel
  stems, and no round blobs of foliage.
- Scenery trees (the woods, plantations and islands round the kampung, not a tree the player builds)
  are their own small sprites, drawn natively at their size in `scenery-trees.ts` with the same
  outline and cel rules, never a shrunk copy of the buildable tree. Palms (kelapa) are 35% of a
  buildable tree's height, oil palms (sawit) 36% to 40%, every other kind 25% to 45%, so the woods
  read as old and young trees together. The shade tree (pohon) is a canopy tree in true isometric:
  two or three stacked tiers, each a disc whose top face is a 2:1 ellipse lit on its top left with a
  band of shade under its rim like a box's side, upper tiers smaller; the crown is about as tall as
  it is wide. Up to five stand on a tile. Trees more than two tiles from the ring road are baked into
  the world canvas and hold still; only those by the road sway. Their trunks are 1 to 2 pixels wide,
  the one exception to the sturdy-trunk rule above (playtest 2026-11-02).
- Big buildings read wide, not tall. A 2x2 building is no taller than a 1x1 of its tier: its size
  shows as width, a long low roof and a deep front, never as a house scaled up (playtest
  2026-11-01: Gudang Material and Koperasi looked like a Rumah blown up). The same goes for 1x2 and
  2x3.
- Site sprites are drawn at native pixels for every footprint. The crane, scaffold and stakes over a
  2x2 site are their own art at 1px lines, never a 1x1 sprite scaled 2x: big pixels look out of
  scale next to the 1px world.

## Outlines

- Outlines are coloured, never a flat ink and never pure black. Every sprite gets a 1-pixel
  outline round its silhouette, and each outline pixel is a 0.45x shade of the fill it touches
  (the fill below first, then the sides, then above). A red roof gets a deep red edge, a bush a
  dark green one. `Painter.finish` does this.
- A line also runs wherever two faces, roof planes or clumps meet, in a 0.55x shade of the pixel's
  own colour, so each form reads as one clean shape. Details painted inside a face (windows,
  stripes, doors) share the face's id and get no line.
- `INK` (`#2a1810`, a dark warm brown) is left for small dark features only: eyes, contact
  shadows.
- Selokan banks are a dark warm grey, `#4a4a44`.
- Set `p.bare = true` to skip the ink pass for flat or lattice art: selokan (it draws its own
  banks so neighbours join up), grass tufts, bamboo scaffolding, the staked plot of a building
  waiting for its permit.
- Big buildings (2x2, 3x3) are drawn at their own size, not scaled up. `new Painter(n)` takes the
  same one-tile coordinates and rasterises every edge, diagonal and outline natively, so a 3x3's
  roofline is a smooth 1px 2:1 line like a warung's, never a scaled stair step. Paint callbacks get
  one-tile rows and columns, so windows and courses keep their proportions. Never stretch a
  finished sprite: its outline comes out n pixels thick and its diagonals scallop.
- A big building starts its art with `p.low()`. Heights, wall rows and wall columns are then native
  pixels while the footprint keeps its n: the building stands as high as a 1x1, windows keep their
  size and repeat along the longer wall, and the roof runs long and low. Measure height above the
  back corner of the lot, not the ground centre, since a deeper lot puts its back corner higher on
  screen. No 2x2 or 3x3 stands taller over its lot than the tallest 1x1 building at the same
  level; the wifi tower, the baliho and the parks with trees are tall by what they are.
  `tests/art.test.ts` checks it.
- Site sprites follow the same rule: stakes and scaffold draw 1px lines on any lot (the scaffold is
  low, the stakes are native pixels with one more stake per side for each extra tile), and the test
  finds no 2x2 block of one colour in them.
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
- Portraits in the UI draw one art pixel as 2 CSS px, the map's smallest zoom, so their outlines and
  eyes are as thick as a walker's. A 44x60 slot holds 22x30 art (`portraits.ts`, Inem's small art in
  `inem.ts`); only Inem's 88x120 plate uses her 44x60 art.
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
| `y` / `a` | `#f4b935` / `#f2b43a` | Mustard accents, bamboo |
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
| Clouds | Long thin streaks that taper at both ends: `#fbf8f2` top to `#c9c2d8` underside, no ink. They float over the open sea above the island's back corner, never over tiles. Drawn per frame (`clouds()`): they slide slowly to and fro and twitch a pixel now and then |
| Volcanoes | Twin volcanoes on the island's back corner (`VOLCS` in `scenery.ts`), part of the same corner-height mesh as the hills: lit triangle facets with the soft tile grid line, joined to the hills by a soft maximum so the skirts flow into the slopes round them. Concave cones with shallow ravines. Materials follow each pixel's height: the hill's own ground at the foot, then forest (hutan), bare rock (tanah), and an ash cap `#b4aea6` to `#cac4bb` with dark cinders. Tiers blend through the 4x4 dither across a band of height. Texture on the cone is sampled on screen, not on the flat world, so the steep slope is not streaked. They run down to the beach and stop short of the ring road. The forest belt is wooded like the hills; rock, ash and anything behind a slope stay bare. The cones' long concave aprons reach the beach, so the land climbs from the sand to the crater with no flat ledge |
| Hutan sawit | Oil-palm plantation blocks of 3x2 to 4x4 tiles on the volcanoes' gentle lower aprons only (never on the cone or a steep tile), up to eight, with a one-tile clearing round each: kebun ground with a packed-dirt track every fourth row, one full-grown oil palm (52% to 56%) in the middle of each tile, so the fronds stay inside the block. Oil palms are dark, with a stout shaggy trunk, a round rosette of stiff arching fronds and an orange fruit bunch |
| Poles and cables | Poles stand inside the kampung only, beside the jalan setapak: one every four to ten path tiles, counted in build order, so every few paths the player builds raise a new pole, each wired to the nearest pole before it on the same straight path, within nine tiles, with path all the way between. A pole with no such neighbour stands unwired. Wires never cross a house, a corner or an empty lot (UI.md rule 17). The ring road has no poles (playtest 2026-11-02). Poles and wires sort with the buildings: each span is cut into one slice per path tile, so a building in front of the path hides it. Each is 26px tall with a crossarm and four cream insulators. Leaning wooden poles at RT, grey concrete poles with a blue number plate and step bolts from RW, and a black fibre bundle on top from Kelurahan. Each span carries four dark wires (`#2f2a26` to `#453c34`) sagging by their own amounts, often a loose low loop, and now and then a layangan caught by its tail, a single sandal or a row of birds. Poles carry the odd junction box or cable coil. Spans sway a pixel with reduce motion off |
| Sea | Open sea on every side and past the world's edges, the same sea texture everywhere |
| Coast | The main island is no diamond: each side's coastline wanders in bays and headlands of a few tiles (`coastAt` in `scenery.ts`) and the four corners are rounded. A beach with foam runs all the way round. The front sides only wander outward, so the sawah, the ring road and the neighbours' roofs stay on land |
| Sea islands | 15 to 18 islands of mixed sizes, never touching land or each other: rocks, sandbars, wooded islets and a few big hilly islands. Big islands carry a small volcano (forest foot, rock, an ash rim, its cone kept clear of trees) or a cluster of three to five karst knolls; about half the middling ones carry one or two knolls. The small volcano has a crater after Kawah Ijen: a truncated cone with a jagged pale rim, a steep bowl, a flat milky turquoise acid lake (`#5fbfb8` to `#8edbd0`, pale streaks `#c4eee4`, no facet light) and yellow sulphur crust (`#c9a62c` to `#e8cf4a`) in patches round its shore and streaks up the walls. Volcano islands use quarter-tile facets so the rim and bowl read; the rest keep half-tile ones. The islands' own land stays low so the knolls and cones give the height. Each is a small corner-height mesh, lit and gridded like the hills, painted in the beach, grass, hutan and tanah materials with coloured borders, a foam ring and a wet-sand bank on the near side, and wooded as thickly as the main island with the map's own shade trees, bushes and palms. No perspective shrink and no haze |
| Hills | Lit triangle facets over corner heights (`cornerHeight`), a soft grid line on each tile edge (0.86 to 0.88 shade) |
| Bare earth | The cliff strata `#7a4c2a`, `#8a5a32`, `#9a6236`, with rare stones `#bdb4a3` and `#6d635a`. Only on steep hill faces |

Rules:

- Warm first. Cool colours (teal, blue) are accents, never the main field.
- Saturated, but not neon. If a colour glows on the dark UI, pull it toward cream or brown.
- No aerial perspective: an isometric view has no near and far, so a far island is drawn like a near one.
- Dithering is for the volcanoes and clouds only: the volcano tiers and the clouds' thin ends blend
  through a 4x4 ordered (Bayer) dither in a few flat steps.
  Sprites and the rest of the ground never dither.
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
| Dock | Four buttons in a grid: Build at its own width, then Warga, Staf and Menu sharing the rest. A 24px icon over a bold label, 52px tall, square, no shadows. Build and Warga use their menu icon plates; Menu is dark green with a three-bar icon. |

| Sheets and pop-ups | Theme tokens: cream and ink in Light, Mono Dark in Dark. Square corners; in Light a 2px ink rule, sheets with a 4px ink lip on top, pop-ups with a hard 4px drop shadow. |
| Combo card | One per row, the full width of the sheet, a 1px rule (2px green when active). Top line: the name in bold on the left; on the right up to three 24px building sprites joined by + and a 24px state square (✓ green, ★ amber, ? muted). Below: the effect in two muted lines. Not-yet cards show black silhouettes. |
| Warga group | A box per job with a 1px rule; No job adds a 6px red left edge. Head: the 40px workplace sprite, "Job · count" in bold, and the group's output on the right. People are 48px chips: name, level stars under it. |
| Resource amounts | A 16px icon, a 4px gap and a bold number in the resource's colour; amounts sit 8px apart and align right. |

- Light and Dark use the same parts at the same sizes. Only the colour tokens change (GAME-DESIGN.md section 6, Themes).
- Numbers use the body font, never the pixel font. Where digits do show in the pixel font (pop-up
  titles such as "Triwulan 2", the 2045 label), each digit must read at a glance, so the "2" is
  redrawn until it cannot pass for a Z (`scripts/patch-pixel-font.py`, as for "f" in
  `decisions/pixel-font-f.md`).

## Lighting and atmosphere

Layers, from the ground up (`src/render/map.ts`, `src/render/atmosphere.ts`):

1. **Ambient occlusion.**
   - Baked: walls darken in their bottom two rows (0.78x, 0.9x).
   - On the map: a soft brown contact shadow pools under every standing building (not selokan,
     parkir or jalan).
   - Sprites also cast a flat ink shadow at 35% to the right. Over a lot the building paints itself
     (a paved yard) the shadow darkens that pixel; over bare map it stays see-through.
2. **Warm grade.** A gradient that is golden from the top left and warm dark toward the bottom
   right.
3. **God rays.** Five soft diagonal shafts from the top left. They dim at dusk and vanish at night.
4. **Vignette.** A deep warm-brown radial vignette, so the kampung reads as a diorama under a
   lamp. It deepens at night.

   Layers 2 to 4 are baked into one cached canvas with plain alpha, and a night version holds just
   the deeper vignette. A frame draws one full-screen blit. Never use per-frame blend modes such
   as `soft-light` or `screen` over the whole view: they cost about 8 ms a frame and fail the
   frame-rate test on slow machines.
5. **Dust motes and leaves.** 28 soft warm motes drift up and to the right by day. At night they
   become blinking green-yellow fireflies. Ten outlined leaves tumble down on the breeze.
6. **Night tint, then lit windows.** Lit windows draw above the tint.
7. **Weather.** Rain streaks, ground ripples and the shower's cool dim draw above the night tint,
   so rain still shows after dark. Shore splashes draw here too (`src/render/weather.ts`).
8. **Tilt-shift.** The top 20% of the map gets a 1.5px backdrop blur that fades out downward
   (`#dof` in `style.css`). Never blur the tiles players tap.

Badges, pops and the ghost outline draw above every lighting layer so text stays readable.

Effects off (or reduce motion) turns off layers 2 to 8. Ambient occlusion stays, and so do the
volcanoes and hills, so the map still has depth.

## Motion

- Ambient loops follow **reduce motion**: clouds drift over the sea. Trees bounce in a slow wave across the map, stretching at
  most 1 art pixel from the roots. Walkers stroll. Fish swim slow loops in ponds: dark lele with
  whiskers in a kolam lele's murky green water, now and then surfacing in a ring; orange and silver
  fish in a kolam pancing (`fish()` in `map.ts`).
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
arcs (^ ^). Only give a face to things that earn the joke. Buildings stay
faceless, so the map stays readable.

## Building levels

- Every level looks different, like a building card in a mobile builder: level 1 is makeshift and
  the smallest, the top level is built to last and the biggest and busiest. The silhouette and the
  materials change, not just the size or the colour (Hari's preferences 1 and 2 above).
  Warung Sembako (`warung-art.ts`): a warung tenda under a red-and-white striped terpal on bamboo
  poles over a crate counter; a gerobak (push cart with a glass snack case) parked under a zinc
  lean-to with a plank back wall, a galon, an LPG melon and a bench; a whitewashed brick toko
  kelontong under a flat dak with a big yellow nameboard and a blue rolling door half up. Every level
  hangs rentengan sachet strips along its front, so it reads as a warung at a glance.
  Pos ronda: bamboo balai-balai under rumbia, wooden hut, green-and-white siskamling post. Kantor RT
  never reads as a rumah: whitewash over a green plinth, a two-tier stepped roof (a low skirt, a band
  of roster, a small crown) in green zinc, then red tile with a concrete kanopi on white columns, then
  a pendopo under a joglo roof. The merah putih flies from a grey pole with a concrete foot in the
  front yard at levels 1 and 2.
- Shops (`toko-art.ts`): Rumah Makan is a plank warung makan with a spanduk, a warkop lean-to, then a
  warteg with a false-front nameboard. Fotokopi is a kiosk, a toko with its banner over the roof, then
  a ruko. Apotek has no house roof: a flat dak with a deep green fascia and a plus-shaped green
  lightbox at every level, an AC unit and a tandon on the roof, from a kios obat to a shop to a
  two-storey apotek. Barbershop has no house roof either and a 2px spiral pole in red, white and blue
  by the door: a stall under a striped tarp, a teal kiosk with a tricolour false front, a charcoal shop
  with a gold lightbox and a lit pole at each end. Bengkel: tambal ban with a tyre on a stick, a garage, a bengkel resmi.
  IndoApril and BetaMart share one shape: a flat dak and a box sign, a pylon and an ATM at level 2.
- Everything else with its own levels (`level-art.ts`, `kampung-art.ts`) grows the same way, by mass:
  Gudang Material from a small zinc shed to a long shed with an open roof bay to the full yard; PAUD
  from a front room to a classroom to an L-shaped school with a playground; Posyandu from a tarp over
  the dacin, to a hut and a waiting shed, to one long clinic across its lot; Kontrakan from a single
  storey L (an orange back wing and a white row of petak with their own door colours, under red
  tile with one narrow sheet of rusty seng) to the same L on two storeys with a walkway; Pasar from one open los to two los
  and kios to a market hall with a raised sawtooth crown; Terminal from one platform to two, with
  buses and angkot; the Kelurahan and Kecamatan offices, Pos Satpol PP, Puskesmas Pembantu, Balai RW,
  Balai Warga, Koperasi, BLK, Baliho and the parks each add a wing, porch, tower, roof tier or yard.
  Balai Warga has a white pagar and a red gapura from level 1; PAUD a rainbow fence, flower beds and a
  yellow bear mascot; Balai RW the merah putih on its ridge from level 1 and a gold Garuda over the
  door from level 2. Taman Bermain is a play set on a rubber mat (a tower with a pyramid roof in the
  back corner, a slide, a climbing wall, monkey bars, a seesaw) with its shade tree clear in the right
  corner. Panggung Senam has umbul-umbul with bent tips and swaying pennants; Kolam Pancing a saung,
  a jetty with anglers, lily pads and a payung.
  Gapura and Portal level 1 are smaller than their level 2. Sawah and Kebun Sayur grow their plants:
  rice from seedlings to golden heads, vegetables from sprouts to fruiting plants.
- Houses grow, not just fence in. Rumah: the bungalow with a wooden dapur under a zinc lean-to, then
  a teras set into the front wall under a strip of the roof colour (door in its shade, a pot plant), a
  jemuran and a low rendered wall one pixel inside the tile's front edges, then a rumah tingkat whose
  ground-floor roof is a skirt of tile round the upper floor, with a balcony rail, a tandon on a frame
  and a motor. Every roof
  shape and colour carries through all three levels, and every level stays on its one tile
  (`tests/art.test.ts` checks every variant). Kos-kosan is tall and narrow from level 1 (two
  floors of rooms under a pelana, a steel stair up the side), then a third floor with a flat dak, a
  tandon and a jemuran on the deck. A house's housing type reads from its silhouette: squat rumah,
  long low kontrakan, tall kos.
- A level never grows more than one storey (8px) over level 1, and nothing but the wifi tower goes
  above 28px. A building that grows taller would hide the small ones behind it. `tests/art.test.ts`
  checks both.
- Sprites with their own level art take `level` as the third argument and are listed in `LEVELLED`.
  Every other sprite (now only those not yet redrawn) gets the upgrade kit along its front edges: a tidy wooden plank fence at level
  2, a clean stone wall with a light cap, potted plants and a lamp at level 3. It is drawn in native
  1px lines after the ink pass, so it is as fine on a 3x3 as on one tile. Ground pieces skip it.
- The inspector shows the level as a roof badge beside the name: a pixel gable roof with a 1px
  coloured edge, an eave that overhangs and droops at the tips (so it never reads as a warning
  triangle), and the number in cream in its lower half. A small green arrow over the peak means an
  upgrade is affordable; the top level is a gold roof with one sparkle pixel and MAKS under it. The
  level art itself shows on the map, in Build and while moving.
- Every icon of a building is the art the map draws: its own footprint (a 2x2 wide, a 1x2 with both
  tiles), its level and, for a placed house, its variant (`buildingURL` in `iso.ts`, `houseVariant` in
  `sprites.ts`). Never a one-tile stand-in: playtest 2026-11-07 found Rumah icons in the default orange
  hip while the house on the map had its own roof, and big buildings squeezed onto one tile.

## Roofs and walls

- Houses look like a perumahan built over the years, not one house copied. `roofShape` draws a
  limasan hip, a pelana (gable) either way round, a mono-pitch shed, or a flat dak beton with a
  parapet round a recessed deck. A rumah's variant picks roof colour, roof shape and wall colour.
- Every house has a band of roster vents under the eave and small weep holes along its base.
  Minimalis houses (shed, flat) get batu alam on the corners, and a flat roof carries a tandon.
- Gable ends and a shed's side are wall, with a small vent near the peak.
- A kampung is built up over the years (`src/render/kampung-kit.ts`, `decisions/distinct-buildings.md`).
  Rumah, Warung, Kontrakan and the other RT and RW buildings stand on a paved yard with a kerb, pots
  at the side corners. Seng is a warm mid grey with a soft rib every third column and no bright
  shine; on clay tile it is a small patched sheet, or rusty brown where it must stay quiet against
  red. A rumah has a painted door, dark window frames and a damp band at its base. Cream houses
  carry a small muted TV antenna that rises from behind the roof. The Kelurahan and Kecamatan
  buildings, paths, farms and parks keep their own ground.
- Each shop type has its own roof, so a row of shops reads as a street.
- No roof shape rises above the hipped roof of the same house at the same level. `tests/art.test.ts` checks it.
- The bank sampah is a TPS: an open concrete bak heaped with bags, a green sign, no roof.
- Look-alikes get different outlines, not just colours: Apotek (green, a cross on a pylon) against
  Fotokopi (blue, a printed banner); Lampu Jalan (a pole with a bent arm) against Patung Ikon (a fat
  golden mini sawit on a plinth); the four Kecamatan offices (a clock tower, a rooftop lookout, a long
  pelana, a monitor or sawtooth workshop roof).

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
- The kampung and the ring road's inner edge keep exact tile edges, so plots and the road always read. The
  coast, sawah, kebun and terraces meet along organic lines, and the beach cliff and wave
  splashes follow them.

## Terraced hills and icons

- Behind the ring road the land rolls into real hills: each tile is two flat-lit triangles over its
  corner heights, drawn back to front, with a soft grid line along every tile edge, like an old
  train-and-city builder's map. The kampung, the ring road and the coast stay flat, so plots, taps
  and the beach cliff never change. The front sawah is flat but for its karst knolls.
- The ring road's outer edge is ragged: the verge (the ground outside it) bites into the road in bays
  and tufts up to about half a tile deep, from a low noise along the edge (`verge` in `scenery.ts`),
  and the forest's tree line starts anywhere from the verge to a couple of tiles out. The road's inner
  edge, against the plots, stays exact. Scenery trees stand on whole art pixels.
- Karst knolls ring the kampung a few tiles past the ring road on every side, front sawah included:
  steep, round-topped limestone hills like those of Gunung Kidul, part of the same corner-height
  mesh. Steep facets show bare limestone (`batu`: `#9c958a` to `#c2baac` in 3px ledges, dark cracks
  `#7d756b`, tufts of green), the rounded top carries a green cap of forest. They keep clear of the
  coast, the volcanoes, the neighbours' roofs and the Kecamatan's district blocks; front knolls are
  smaller, since the sawah there is narrow. A thick ring of trees stands at each knoll's foot behind
  and beside it, thinning to bushes on the side facing the viewer so the limestone shows.
- Toward the volcanoes the hills carry terraces: kebun teh on the left, sawah terasering on the
  right. Each terrace is a band of the real hill height. Its riser is a lit rim over a dark line,
  steps alternate light and dark, and slopes facing the top left are lit.
- Trees stand on the hill surface, up to three per tile, so most of the green land reads as woods:
  forest and the volcanoes' forest belt are thick with shade trees, the kebun mixes palms, pisang and
  shade trees, open grass past the ring road has groves and bushes, and the tea hills keep a scatter
  so their rows still read. Sawah, terraces, bare earth and steep faces stay open, and so do the
  kampung's tiles and the ring road. Every shore rises gradually: hills and volcanoes ease up from the
  beach over a few tiles.
- Menu icons sit on a cream bevelled plate, like the tool panel of an old isometric city builder.
  Panels about the kampung show a tiny scene drawn with the map's own sprites. Abstract ones show
  their glyph in dark ink with a brick-red accent.

## Adding a sprite

1. Add a function to `ART` in `src/render/iso.ts`, or to the table in the art file it belongs with
   (`toko-art.ts` for shops, `level-art.ts` for levelled buildings), and list it in `LEVELLED` if it
   draws its own levels. Start with `p.shadow(inset)`.
2. Build it from `box` and `roof` with palette keys, and paint details per face through the
   `paint` callback.
3. Keep it inside the tile's footprint and under the 40-pixel headroom. A 2x2 or 3x3 building is
   still written in one-tile coordinates: `iso(name, variant, n)` draws it natively at n.
4. Let the outline pass run, unless it is a flat decal or lattice (`p.bare = true`). Flat decals
   that tile, like selokan and jalan, draw their own edges so neighbours join up.
5. Check it at 4x on grass next to the existing sprites, as a black silhouette beside its neighbours
   and at every level, then in game at day and night.
6. If it is flat (people walk over it), add it to `FLAT` in `people.ts` and `FLAT_AO` in `map.ts`.

## Checklist before merging art

- [ ] Hari's art preferences above: a distinct silhouette, levels that grow in shape, no bubble trees.
- [ ] Straight isometric lines; round only where nature is round.
- [ ] 1px coloured outline (a dark shade of the fill it borders), no pure black anywhere.
- [ ] Two-tone cel shading lit from the top left. Texture in flat painted steps, not noise.
- [ ] Terrain borders use a coloured dark edge and a soft bright rim, not a black line.
- [ ] The screen edges stay the darkest part of the view (the vignette).
- [ ] Colours from the palette, warm first.
- [ ] Reads at 2x on a 320px-wide phone, by day and at night.
- [ ] Animation is whole-pixel and respects reduce motion and effects.
- [ ] The touched e2e specs pass locally, including the frame-rate test. CI runs the full suite.
