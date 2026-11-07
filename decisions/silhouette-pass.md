# Silhouette pass for the first-2h buildings (2026-11-07)

Hari asked for every building unlocked in the first 2 hours to be told apart by its outline, and for each level to grow in shape. Worked in four rounds of local renders, each judged by Hari before the next (`docs/plans/visuals-first-2h.md` holds the rounds, the images and the sources).

## What changed

- **Shops** (`src/render/toko-art.ts`): Rumah Makan, Fotokopi, Apotek, Barbershop and Bengkel get their own level art. IndoApril and BetaMart share one silhouette and differ only in colour and pattern, with colour schemes close to the real chains.
- **Levelled buildings** (`src/render/level-art.ts`, `src/render/kampung-art.ts`): Gudang Material, PAUD, Pos Satpam, Koperasi, Kontrakan, Balai Warga, Balai RW, Pasar Kaget, Portal, Gapura, Posyandu, all Kelurahan buildings (with buses at the Terminal), all Kecamatan buildings (with a new Baliho), Taman and Taman Kota. Each level adds a mass. Rumah, Kantor RT, Rumah Makan, Warung Sembako, Portal and Gapura level 1 or 2 are now smaller than the level above.
- **Trees**: the buildable Pohon Rindang and the parks use the tiered canopy tree, not round blobs.
- **Look-alikes**: Lampu Jalan has a bent arm. Patung Ikon is a fat golden mini sawit. Mural is a wall. The Kecamatan offices each have their own outline.
- **Farms grow**: rice and vegetables stand taller each level.
- **Life**: fish swim in Kolam Lele (lele) and Kolam Pancing (`fish()` in `map.ts`), still with reduce motion.
- **Engine**: `src/render/massing.ts` adds `prism` and `roofRect` (a box and a roof over any rectangle of a lot). `Painter.box` now draws the back half of a box's top face, which it had always skipped: the notch showed in every flat roof.

## Docs

ART.md is updated to match (choice 2 of the conformance protocol, asked for by Hari): a new "Hari's art preferences" section, chain colours allowed without logos or names, the massing helpers, no bubble trees, levels that grow in shape, look-alikes, and fish. The preferences are the ones Hari gave in this pass, written down so later art follows them without being told again.

## Checks

The art tests still hold every rule: each level at most one storey over level 1 and under 28px; a 2x2 no taller over its lot than the 1x1s of its level; art inside its footprint. A few designs were trimmed to fit: the Kantor RT level 1 board stands on a tall post, the level 3 flag is a pixel shorter, the Kantor Kecamatan clock tower stands on the front corner, and the gapura, Pos Satpol PP and Baliho tops are lowered. `tests/higher.test.ts` finds art through `hasArt()`, since stage art now lives in several tables.
