# Light sheets, a Buku Combo grid and Warga job groups, clamped lines

The person saw sheets and pop-ups stay dark under the Light frame, and asked for them to match, and for the Buku Combo and Warga list to be easier to read, with icons. Three looks were prototyped and rendered locally (a: cards, b: collection grid and job groups, c: ledger with filters and totals). The person picked **b with the filters from c**, for both lists.

- **Sheets follow the theme.** Light tokens now apply to the whole page, not just the frame. "Sheets and modals keep their own dark look" in GAME-DESIGN.md section 6 is replaced. Resource colours in the DOM use CSS variables (`RES_VAR`), so they swap with the theme; the canvas keeps `RES_COLOUR`.
- **Buku Combo:** collection cards with filter buttons All / ✓ / ★ / ? and their counts. A card opens the full entry below it. The first build used two cards per row; after a local render the person asked for **one full-width card per row**, so the name, buildings and state fit on one line and the two-line effect has room.
- **Combo tip:** the How to play / tip picture for combos drops the word "Combo" (the person's call: the heading already says it). It now shows Warung + Pos Ronda.
- **Home screen** keeps its dark tokens in the Light theme, so its title and buttons stay legible over the map.
- **Warga:** groups per job (workplace sprite, count, monthly output), people as chips with level stars, under a summary line and filter buttons By job / No job / By level.
- **UI.md rule 5 exception (the person's choice: "clamp, tap shows all").** The goal pill keeps to one line and a Buku Combo card's effect to two, cut with an ellipsis. Both sit inside a button that shows the whole text in one tap, so nothing is lost. Clamped text is marked `data-clamp`; the legibility scan skips ellipsis and clipping only for those inside a button.
- **Icons on the right** (resource amounts, corner marks) use one spacing: 4px icon-to-number, 8px between amounts, aligned right.
- Docs: GAME-DESIGN.md (combos, section 6 Touch and layout and Themes), UI.md rule 5, ART.md (UI chrome), CONTRIBUTING.md.
