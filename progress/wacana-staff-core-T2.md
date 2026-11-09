# T2: Programs count in the quarterly ranking

Added `programScore` to `src/sim/ranking.ts` and folded it into `score()` and `scoreParts()`, with new `SCORE`
constants, cleared program state in neighbour views, and updated the Realisasi header comment and GAME-DESIGN.md §4.
Added `tests/wacana-ranking.test.ts` (score rises on announce, decays back to 0, AI score unchanged) and included
`programs` in the grow score-parts sum.

