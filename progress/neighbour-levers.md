# Neighbour levers

- `NEIGHBOUR.fundMax` 3 → 12, `fundBulk` 6, `boostMax`/`boostDecay`, `autoLevels`, `autoFloor` (`src/sim/balance.ts`).
- `fundNeighbour(s, n, count)`, `boostOf`, `buildEvery`, `setAutoFund`, `autoMonthly`, `autoFloor`, monthly auto-dana, and progress-based build pace (`Neighbour.progress`, `autoKeep`) in `src/sim/grow.ts`.
- `comboShare` on an AI RT's view (`src/sim/neighbourView.ts`), read by the `combos` goal. `starChecklist` in `src/sim/stages.ts`.
- Neighbours screen: next-star checklist, Dana x1 and x6, "+N% boost", auto-dana row (`src/ui/neighbours.ts`).
- Tests: fund cap, boost curve, auto-dana floor, shared combos, a Rajin bot reaching 3★; e2e for x6 Dana, boost text and auto-dana.
