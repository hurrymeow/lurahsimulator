# AI variety and ranking explained

- `WANTS` widened; `nextWant` (star gating, partner-first, least-built); combo-completing placement in `build` (`src/sim/grow.ts`).
- `scoreParts` in `src/sim/ranking.ts`; `rivalTarget` and `nextRanking` in grow.ts; a ranking line and help on the Neighbours screen (EN, ID).
- Tests: each trait builds 10 or more kinds, finds 3 or more combos and reaches 3★; partner-first pick; score parts sum. The old "Rajin finds one combo" assertion is dropped.
