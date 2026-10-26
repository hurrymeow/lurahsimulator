# Art direction

How Kampung Story looks, and how to keep new art in that look. Follow this for every sprite, scenery
change and effect. [DESIGN.md](DESIGN.md) still rules on UI, legibility and accessibility.

## The look in one line

A warm, lamp-lit diorama of a kampung: a party game's bold outlines and cheeky faces, painted in
a storybook palette, lit like an HD-2D village.

Three references, each for one thing:

| Reference | What we take | What we leave |
| --- | --- | --- |
| Bishi Bashi Special | Bold ink outlines, flat cel shading, cheeky faces (the sun), bouncy timing | Wonky, hand-wobbled shapes. They clutter a busy map. |
| Warm isometric illustration (kitchen diorama) | Terracotta, mustard, teal, cream and olive. Dark brown ink, not black. Cosy clutter on the edges. | Paper grain and noisy texture |
| Octopath Traveler (HD-2D) | Golden key light, god rays, deep vignette, tilt-shift blur, dust motes, contact shadows | Photoreal bloom, heavy blur over playable tiles |

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

## Ink

- Ink colour: `#2a1810`, a dark warm brown (`INK` in `iso.ts`). Never pure black.
- Every sprite gets a 1-pixel ink outline round its silhouette. `Painter.finish` does this.
- Ink also runs wherever two faces, roof planes or clumps meet, so each form reads as one
  clean shape. Details painted inside a face (windows, stripes, doors) share the face's id and
  get no ink.
- Set `p.bare = true` to skip the ink pass for flat or lattice art: selokan (it draws its own
  banks so neighbours join up), grass tufts, bamboo scaffolding.
- Terrain gets an ink line wherever two land types meet, and along the horizon.
- Walkers get the same 1-pixel outline.

## Shading

- Flat, two-tone cel shading. No dithering, no speckle noise.
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
| Grass checker | `#7a9a45`, `#82a34b` |
| Road | `#d08a52` |
| Sawah | `#9cc155` / `#86ab45` rows, ripe `#e8b440` / `#d39a32`, bunds `#8a5a32` |
| Kebun, hutan | `#5f8a3c`, `#4a7334` |
| Beach, sea | `#efd49a`, `#3f8f8c` with `#7fc4b8` wave dashes |
| Sky sunburst | `#f3d9a8` and `#f7e5bd`, 32 rays from the sun |
| Mountains | Hazed toward the sky: `#8fae94` lit, `#6f9083` shade, ink `#6a5a4c` |

Rules:

- Warm first. Cool colours (teal, blue) are accents, never the main field.
- Saturated, but not neon. If a colour glows on the dark UI, pull it toward cream or brown.
- Far things fade toward the sky colour (aerial perspective), ink included.
- UI chrome stays Mono Dark. Colour belongs to the map and to resource meaning.

## Lighting and atmosphere

Layers, from the ground up (`src/render/map.ts`, `src/render/atmosphere.ts`):

1. **Ambient occlusion.**
   - Baked: walls darken in their bottom two rows (0.78x, 0.9x).
   - On the map: a soft brown contact shadow pools under every standing building (not selokan
     or parkir).
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
6. **Dust motes.** 28 soft warm motes drift up and to the right by day. At night they become
   blinking green-yellow fireflies.
7. **Night tint, then lit windows.** Lit windows draw above the tint.
8. **Tilt-shift.** The top 20% of the map gets a 1.5px backdrop blur that fades out downward
   (`#dof` in `style.css`). Never blur the tiles players tap.

Badges, pops and the ghost outline draw above every lighting layer so text stays readable.

Effects off (or reduce motion) turns off layers 3 to 8. Ambient occlusion and the halo stay, so
the map still has depth.

## Motion

- Ambient loops follow **reduce motion**: the sun bobs 2 art pixels and blinks every 3.2 s, with a
  quick double blink every third time. Trees bounce in a slow wave across the map, stretching at
  most 1 art pixel from the roots. Walkers stroll.
- Particles, coins, lighting layers, motes and night follow **effects**.
- Timing is bouncy, not floaty: short squashes (income, about 320 ms), quick pops (about 350 ms),
  slow ambience (sway periods of 2 s or more).
- Motion is whole-pixel. A bounce stretches by one art pixel. It never slides sub-pixel.

## Faces

Faces are where the Bishi Bashi cheek lives. Keep them simple: oval ink eyes with a one-pixel
sparkle, rosy cheeks (`#f07f86`), an open smile with a pink tongue. Blinks are happy closed
arcs (^ ^). Only give a face to things that earn the joke (the sun today). Buildings stay
faceless, so the map stays readable.

## Adding a sprite

1. Add a function to `ART` in `src/render/iso.ts`. Start with `p.shadow(inset)`.
2. Build it from `box` and `roof` with palette keys, and paint details per face through the
   `paint` callback.
3. Keep it inside the tile's footprint and under the 40-pixel headroom.
4. Let the ink pass run, unless it is a flat decal or lattice (`p.bare = true`).
5. Check it at 4x on grass next to the existing sprites, then in game at day and night.
6. If it is flat (people walk over it), add it to `FLAT` in `people.ts` and `FLAT_AO` in `map.ts`.

## Checklist before merging art

- [ ] Straight isometric lines; round only where nature is round.
- [ ] 1px `#2a1810` outline, no pure black anywhere.
- [ ] Two-tone cel shading lit from the top left, no noise.
- [ ] Colours from the palette, warm first.
- [ ] Reads at 2x on a 320px-wide phone, by day and at night.
- [ ] Animation is whole-pixel and respects reduce motion and effects.
- [ ] `npm run e2e` passes, including the frame-rate test.
