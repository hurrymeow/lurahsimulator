# Smaller map T3

Added the `sebelahAtStars` (stars of cell (1,0)) and `rw2AtStars` (lowest stars in the `cy === 1` row) goal kinds in `src/sim/types.ts` and `src/sim/stages.ts`, with their check and text keys. Added the English and Indonesian goal and short texts and reworded `fundedRts` to name Kampung Sebelah. Added `tests/grow.test.ts` cases for both new kinds, including the empty-neighbour zero case.
