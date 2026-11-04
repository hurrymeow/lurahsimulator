# Build cards: one line per card

Plan: `docs/plans/ui-audit-fixes.md` T6. Ported from executor PR #255 (stale since 2026-11-01) onto current main, then finished.

- Each card is one tappable line: sprite, name, NEW tag, cost, the owned count and, for housing, a house icon with the bed count. An `i` button beside it opens the detail.
- The detail holds the blurb, size and permit, the housing and attract lines, then Place (the one primary) or the full missing list. A back button returns to the Build tabs.
- **Beyond the plan:** with only the plan's changes, the Kelurahan seed still counted 53 to 61 words in view on three tabs (EN 412, ID 430). The plan said not to touch the header lines (`pop.line`, `stage.next`), so the cut came from the cards:
  - The owned count on the card is `×35` or `×3/3`. Its `aria-label` and the detail keep "35 owned".
  - A card at its cap says "Limit reached" (2 words) in place of "Limit 2. Upgrade the one you have instead". Every other missing reason shows in full, and the detail lists them all (UI.md rule 9).
- The two assertions the executor left failing now check the new layout: the owned count reads `×N` with the words in its label, and "no permit" appears once in the detail.
- Warga: the English hint "Tap a resident to change their job." is now "Tap someone to switch jobs.", which brings EN at 412px back under its cap (496 to 494). Most of that sheet's words are resident names.

## Verdict (self-approved under the TODO approval rule)

- UI.md rule 13: the four `build` entries are deleted from `DENSITY_ALLOW`. The density test passes at 320, 360 and 430px in ID and at 320, 412 and 430px in EN.
- Rule 14: the detail has one primary (Place). The cards have none.
- Rule 9: a locked card still names its first missing thing, and the detail names all of them.
- Rule 1: the info button is 48px.
- Seen in passing: the Kelurahan seed shows counts above a cap (IndoApril ×6/2). The absorbed Kampung Sebelah brings its shops along. This is logged as a TODO item.
