# Pak Camat's board, T2: the sheet and Pak Camat's notice

T2 of `docs/plans/camat-board.md`.

## What changed
- `src/ui/board.ts`: the sheet. An intro line, then one row per goal: the goal line, its reward, and for goals that ask for more than one (Dana twice, Aman for 8 weeks) the progress, such as "1/2 · Reward: Rp ...". A done goal has a Claim; a claimed one says so until the quarter turns. A goal that went up since the last look carries New.
- `src/systems.ts`: a `board` ActionButton in Menu's Kampung group, shown once `s.board` exists (RT 1★). Its badge counts goals that are new or done and unclaimed (`boardWaiting`), and Menu sums it like the other panels.
- `src/sim/board.ts`: `boardGoalText`, `boardProgress`, `boardWaiting`, `markBoardSeen`. `BoardState.seen` keeps the week the board was last opened; old saves have none, so their goals read as new once. `boardSystem` and `boardQuarter` take `fx` (optional, so T1's callers stand) and push Pak Camat's notice when a goal goes up.
- Strings in both languages under `board.*`, sorted in place.

## Calls made
- **The plan's "Menu row" is a Menu tile.** CONTRIBUTING.md: a new panel registers an `ActionButton` with a group. Menu is a grid of tiles under the stage row, so the board is a tile there with a count tag, like Staf's applicants. No conflict with the docs.
- **The quarterly Pak Camat message is a toast, not a card.** The new goal arrives in the week of the quarterly ranking, whose result is already a card; a second card there breaks UI.md checklist item 13 (never two pop-ups within 20s), and Pak Camat's existing call is a ticker line, "never a popup" (`src/sim/lines.ts`). The toast reads "Pak Camat menelepon / Tugas baru di papan: ..." and stays in the Log; the Menu count shows what waits.
- **One primary.** When two goals are done at once, only the first Claim is filled (UI.md rule 14); the others are secondary.
- **Icon.** The tile uses the shared fallback icon, as Staf and Lomba do. `src/render/icon-art.ts` is generated and must not be hand-edited, so a board icon waits for the next icon sheet (follow-up).

## Checks
- `tests/board.test.ts`: each new goal gives one notice, never a card or fanfare, naming the goal; the count clears on opening and on claiming; Dana and Aman progress; every goal line exists in both languages in 12 words or fewer.
- `tests/e2e/ui.spec.ts` "Pak Camat's board" at 320 and 360 id and 412 en: the tile shows the count, opens the sheet with three rows, one primary, legibility, density (rule 13) and label words (rule 16) pass; a claim pays Orang Dalam +1 once and the count clears.
- `npm run typecheck`, `npm test` (687 passed). The density, menu-icon and Menu e2e groups pass at 360 id and 412 en. The vertical-centring test fails locally on the home screen's ⚙ the same way on main (Windows fonts); CI judges it.

Verdict: self-approved under the TODO rule. Follows the docs. Bots claiming goals and the bars are T3.
