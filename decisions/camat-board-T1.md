# Pak Camat's board, T1: state and pool in the sim

T1 of `docs/plans/camat-board.md`.

## What changed
- `src/sim/board.ts`, `src/data/board.ts`: `GameState.board` (absent until RT 1★, so old saves need nothing). `boardSystem` runs weekly: it opens the board with one goal at RT 1★ and marks goals done. `boardQuarter` runs after each quarterly ranking: claimed goals leave, and one new goal comes, pushing out the oldest open one when the board holds 3. `claimBoard` pays a done goal once.
- The pool, each offered only when doable now and not already on the board: Bimtek someone (Orang Inside +1), hire into an empty slot (Rupiah), land a Realisasi (Popularitas +5), a quarter with no Wacana (Popularitas +5), clear the Stempel backlog from 3 or more (Orang Inside +1), send Dana twice (Rupiah), build a Decor (Popularitas +5), Aman 60+ for 8 weeks at the Kecamatan (Orang Inside +1). Rupiah is 2 weeks of net income, at least Rp 500.000 before prices. Stempel +3 is in the data for a later goal.
- Bimtek courses and Dana sent are counted in `board.tally` (`tallyBoard` in `bimtek` and `fundNeighbour`); everything else reads state the sim already keeps.
- The new goal is picked by the week, not the game's dice, so the board shifts no other random roll.

## Checks
- `tests/board.test.ts`: opens at RT 1★ and not before; one goal a quarter, never more than 3, no repeats; RT-only pool (no Stempel, Dana or Aman goal at the RT, no Wacana goals before any Wacana); a done goal pays once on claim and leaves next quarter; Tanpa Wacana needs a full quiet quarter and breaks on one announcement; no board goal in the star checklist.
- Builder, hint reader and honest bots, seeds 1 to 6, main against this branch: every star on the same week (Kel 3★ 50.4, 55.2 and 48.8 min on both). Nothing claims yet, so nothing moves. T3 teaches the bots to claim and measures the bars.

Verdict: self-approved under the TODO rule; the plan's decisions 1 to 5 hold. No UI in T1.
