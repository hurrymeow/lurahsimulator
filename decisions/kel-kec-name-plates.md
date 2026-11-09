# Kelurahan and Kecamatan: name plates, small details, Taman Kota overlaps (2026-11-09)

Koko asked for the Kelurahan and Kecamatan buildings to carry as much small detail as the early RT buildings, for name plates on top where they help, and for a check of sprites overlapping each other (Taman Kota level 3).

- **Name plates:** `namePlate()` in `src/render/sign-art.ts` letters a short name in a 3x5 pixel font on a framed board, slanted with the front-left wall. Short names only, because a 2x2 front wall is about 25px wide: LURAH, PUSTU, PASAR, TERMINAL, TAMAN, CAMAT, SATPOL / POL PP, KSP, BLK. They are Indonesian proper names in both languages, so they live in the art, not in i18n. Level 1 stands it on posts (a papan nama, as real kantor have); higher levels put it on the eave, parapet or crown.
- **Details:** parked motors (`motorAt`), AC units, benches, lamp posts, cones, a loan spanduk, pasar baskets, payung and a gerobak, the camat's dinas car, a pustu oxygen tube. All inside the lot (`tests/footprint-art.test.ts`) and under the level height limits (`tests/art.test.ts`).
- **Taman Kota:** level 2 and 3 had a tree in front of the fountain, and the level 3 stage was drawn over the right tree. Trees now stand only at the back and sides; level 3 swaps the back tree for a pendopo stage, puts a statue on the fountain and adds flower beds, lamps and a gate plate.
- Tried and dropped: a tandon on hipped roofs read as a golden finial.

Before and after: `docs/plans/sprite-pass-1109/`.

Updates the docs: ART.md, Building levels (name plates and details).
