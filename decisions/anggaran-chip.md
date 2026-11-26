# The yearly Anggaran shows as its own chip, and its arrival pops at the Kantor

TODO item "Big cash jumps have no explanation" (agent playtest 2026-11-25, #484).

## What was wrong
- On the `rw` seed after the SK, money went from Rp 11jt to Rp 180jt in one week. The Anggaran landed in the kas with only a small toast ("Anggaran turun"), and no number popped on the map: `kelSystem` called `gain()` with no position.
- Nothing on screen showed the budget apart from personal cash, or how long was left to spend it. The rule that unspent money shrinks next year's budget was in the toast only.

## What changed
- **The arrival pops at the Kantor** (Kantor Kelurahan, else Kantor RT): the "+120jt" number rises where the money comes from (UI.md rule 11, feedback ladder).
- **A chip under the satellite view, in the Kelurahan only:** "Anggaran: 120jt · 34 mgg" ("Budget: 120jt · 34 wk"). It shows what is left of the year's budget (`budgetLeft` in `src/sim/kel.ts`: budget minus spending this year) and the weeks to December. That is 4 words; numbers are not words (rule 16).
- **Tapping the chip** shows the rule as a toast: "Anggaran: Habiskan sebelum Desember, atau tahun depan menyusut." A first, longer text was cut by the toast's 8-word limit (`toastParts`), so it was shortened to fit.
- The repair-all chip moves under the budget chip when both show (CSS only).

## Not done here
- The item's other ideas: coins flying into the money chip, and a bar. The chip and the pop meet the done-when ("the yearly budget arrival is shown on screen with its amount and deadline").

## Checks
- **Unit:** `tests/kel.test.ts` covers `budgetLeft` (null at the RT; what is left; weeks to December) and the arrival pop.
- **e2e:** a new test checks that the chip is hidden at the RT and shows at the Kelurahan with amount and weeks, then runs the legibility scan and the tap's toast. It passes at 320 id and 412 en, as do the funding, repair and density tests.
- **Screens:** at 412 the two chips stack under the satellite view. At 320 both sit at the bottom right, like the repair chip today, and a toast covers them while it shows (3 s).
- `npm run typecheck` and `npm test` pass.

## Verdict
Self-approved under the TODO rule (UI.md rules 11, 13 and 16).
