# Pak Camat's board: side goals between stars

TODO item "Secondary goals board from Pak Camat (Kairosoft style)" (joofoot, 2026-11-09). Option C of `docs/plans/wacana-staff-core.md`.

## Goal
Between two stars there is often a long stretch where the open goal lines move slowly (a ranking count, a serapan run). Kairosoft fills that stretch with small, rotating side goals that pay a little and never block progress. This plan adds three such goals at a time, set by Pak Camat, that send the player back to Staf, Wacana and the map.

## Decisions
1. **Never gates a star.** Board goals sit apart from the star checklist, as Inem's gigs do (`GIGS`, GAME-DESIGN.md "Inem's dream"). They count as a "Goal" for the scorecard goal-gap bar (§8, band table: "a star checklist line, an SK, Lomba Agustusan, or an Inem gig"); GAME-DESIGN.md adds "or a Camat board goal" in T4.
2. **Three at a time, one a quarter.** The board holds 3 goals. When the quarterly ranking runs, the oldest unfinished goal leaves and a new one comes. A finished goal is replaced at the next quarter too, so the board never refills faster than once per 12 weeks. Pak Camat's existing call (`sim.camatTitle`) becomes the card that names the new goal.
3. **From the RT at 1★.** The first board comes with RT 1★, so the tutorial and the first star stay clean.
4. **Small, sure rewards.** Each goal pays one of: Orang Inside +1, Rupiah worth about 2 weeks of net income (scaled with `price`), Popularitas +5, or Stempel +3. No reward is a building, a star line or a permanent bonus.
5. **The pool** (each with a check the sim already has, or a counter it can keep):
   - Bimtek someone this quarter (`bimtek`).
   - Hire for an empty role (`hire`).
   - Realisasi one program (a Realisasi finishing, `src/sim/wacana.ts`).
   - Announce no Wacana this quarter (Pencitraan's opposite; pays Popularitas).
   - Clear the Stempel backlog to 0 (`s.stempel.backlog`).
   - Fund a neighbour RT twice (`fundNeighbour`), from the RW.
   - Build one of a named Decor (keeps the late cash sink alive, scorecard row 14).
   - Keep Aman at 60+ for 8 weeks, from the Kecamatan.
   - Win this quarter's ranking by 10% or more (only once the rival is close: see TODO "Stars still follow time in the stage").
   A goal is offered only when it can be done now: its building or action is unlocked, and it is not already true when it appears.
6. **Where it shows.** A "Papan Camat" row in Menu, under the stage row, with a count tag when a goal is new or done and unpaid. It opens one sheet: 3 rows, each one line (goal and reward), a Claim button on a done goal. UI.md rule 13: 3 lines of at most 12 words, well under 50 in view. Rule 14: Claim is the only primary. No new HUD element: the goal pill stays the star's.

## Tasks

### T1. Board state and pool in the sim
- Files: `src/sim/board.ts` (new), `src/sim/types.ts`, `src/sim/save.ts`, `src/sim/tick.ts`, `src/data/board.ts` (new), `tests/board.test.ts` (new).
- `GameState.board?: { goals: { id: string; since: number; done: boolean; claimed: boolean; base?: number }[] }`, filled from RT 1★. `boardSystem(s, fx)` runs after the ranking each quarter: drops the oldest open goal or any claimed one, adds one from the pool that is offerable now, and records a `base` value where the goal counts change (Bimtek count, Realisasi count). Weekly it marks goals done. Save: old saves get an empty board.
- Tests: offered only when doable; never more than 3; one new goal a quarter; a done goal pays once on claim; a board goal never appears in `starChecklist`.

### T2. The sheet and the card
- Files: `src/ui/board.ts` (new), `src/ui/menu.ts`, `src/i18n/en.ts`, `src/i18n/id.ts`.
- Menu row with count tag; the sheet as decided above; the quarterly Pak Camat card names the new goal ("Pak Camat: Bimtek satu staf triwulan ini."). Strings in both languages, Indonesian first in voice.
- Tests: e2e at 320px id and 412px en: the row opens the sheet, a done goal claims once, density and legibility pass.

### T3. Bots and the bars
- The scorecard driver claims done goals (all bots but idle) and the hint reader also works the board after its star hints.
- Bars, nine player types on seeds 1 to 6 against main: star times move by no more than 1 quarter for any type (the board never gates); the longest goal gap (§8 row 7) falls at the RW and Kelurahan; the builder spends at least 2 more Orang Inside per stage (row 13); cash at the end falls for the shopkeeper (row 14).

### T4. Docs
- GAME-DESIGN.md: the board under Staff, and the Goal definition in the band table. UI.md rule 2 already allows it (everything else opens from Menu); add the board to the density e2e list (rule 13). A decisions/ note with the bot numbers.

## Open questions
- Is a quarter the right beat, or should a new goal come each month with a 4-week deadline? The quarter matches the ranking and the report card, so it is the default.
- Should an unclaimed done goal expire? Default: no, it waits; only open goals rotate out.
- Rewards in Rupiah stop mattering once cash piles up (scorecard row 14). If the bots show that, swap Rupiah for Orang Inside from the Kelurahan on.
