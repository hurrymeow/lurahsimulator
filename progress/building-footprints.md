# Building footprints, zoom and the Warga list

Shipped:

- Buildings have a footprint. Indomaret, Alfamart, Wifi Tower, Kos-kosan, Lapangan, Balai RW and Pasar Kaget take 2x2. The rest stay 1x1. Sizes and sources are in `decisions/building-footprints.md`.
- `src/sim/footprint.ts` is the one place that knows a building's tiles. Placement, tap picking, empty tiles, combos, path bonus, parkir spawn, walkers, AI RT builds and drawing all go through it.
- The Build sheet and placement bar show "Takes 2×2". A blocked lot names what is in the way.
- Saves move to v3. Old 2x2 buildings grow into free ground, or stay 1x1 when boxed in.
- Zoom: mouse wheel and trackpad pinch on PC, two-finger pinch on phones, + and - on the keyboard. It zooms around the pointer.
- Warga: after you pick a job, the list returns scrolled to that resident.
- Tests: `tests/footprint.test.ts` (lots, ranges, migration, AI RTs), an updated balance bot, and E2E tests for the 2x2 placement bar, the Warga scroll, and wheel and pinch zoom.
