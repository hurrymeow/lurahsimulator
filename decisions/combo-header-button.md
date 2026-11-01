# Combo book moves to a Build header button

Plan: docs/plans/combo-header-button.md. Approved by Hari, 2026-11-01 (option A).

- Combo is no longer the 5th Build tab. The tabs list only things you can place.
- A header button (book icon plus found/total) sits left of the close button. Tapping it swaps the sheet body to the Combo book. A "‹ Bangun/Build" button takes its place.
- The close button stays in the same corner in both views. The Combo book is never remembered as the last tab.
- NEW tag on the header button when a combo was found since the book was last viewed. Stored as `pakrt.comboSeen`, cleared on a new game.
- The four building tabs now share one row, which the Build tabs spec already expects. The plan's 2 + 2 idea was dropped.
- Rejected: a Build | Combos switch (two tab rows) and a "Combo book" row at the list end (scrolls away).
- Supersedes the tab placement in decisions/combo-in-build.md, which is left as is.
