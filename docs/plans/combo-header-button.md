# Combo book: a header button in the Build sheet

Approved by Hari, 2026-11-01 (option A).

## Goal

Combo stops being the 5th Build tab. It opens from a labelled button in the Build sheet header, left of the close button. The four tabs list only things you can place.

## Decisions and why

- **Header button, not a tab.** The tabs answer "what can I place". The Combo book answers "what have I found". As a tab it read as a 5th building category (Hari).
- **Icon plus count as text** (pixel `book` icon + "0/24"). An icon alone fails the "find the Combo book" first-click test in UI.md. The count also shows progress.
- **Swap, not a new layer.** Tapping it replaces the sheet body with the Combo book. The title becomes "Combo", and a "‹ Build" button sits where the Combo button was. Still one panel deep, still 2 taps from the map (UI.md rule 13).
- **Close stays in the same corner.** ✕ keeps its place in both views.
- **Build still opens on the last building tab.** Combo is never remembered, as in #209.
- **NEW tag** on the header button when a combo was found since the player last opened the book. Clears on a real view, not on opening Build.
- **Rejected:** a Build | Combos switch (two stacked tab rows, the look Hari objected to) and a "Combo book ›" row at the list end (scrolls away, reads as a primary button, rejected in #209).
- **Not the Menu.** Hari wants it in this sheet. No panel appears in two places (UI.md rule 2).

## Tasks

### 1. Header slot in `openSheet` (Sonnet)
- Files: `src/ui/sheet.ts`, styles for `.sheet-head`.
- Add an optional header action node placed before ✕. Other sheets are unchanged.
- Done when: other sheets render byte-identical heads; typecheck passes.

### 2. Combo button and swap (Sonnet)
- Files: `src/ui/build.ts`, `src/ui/lists.ts` (count helper if missing), `src/i18n/en.ts`, `src/i18n/id.ts`.
- Remove the `combo` tab from the tab bar. Below 412px the four tabs sit 3 + 1 or 2 + 2; pick the layout that keeps no lone full-width button.
- Header button: `book` icon + "found/total", `aria-label` "Combo book" / "Buku Combo", at least 44px tall.
- Swap view: title "Combo", "‹ Build" back button in the header slot, then `comboBook(app)`. Back restores the last building tab and its scroll.
- NEW tag logic for unseen combos.
- Done when: Build opens on buildings; one tap opens Combo; one tap returns; ✕ closes from both views; history back closes the sheet.

### 3. Copy (Sonnet, same PR)
- `how.4.body` and `how.13.body` in EN and ID still say "Build, Combo". Keep the path wording but drop the idea of a tab if any tutorial line says "tab".
- Done when: no player text calls Combo a tab.

### 4. Tests (Sonnet, same PR)
- `tests/e2e/ui.spec.ts`: replace `data-tab="combo"` lookups with the header button. Add: no clip at 320px ID and EN for the header button; ✕ in the same spot in both views.
- Visual baseline for the Build sheet will change. Regenerate it in CI, not via the bot workflow.
- Done when: touched specs pass at 320 and 412 in ID and EN.

### 5. Docs (same PR)
- UI.md rule 2: "the Combo book is the last tab of Build" becomes "the Combo book opens from a button in the Build sheet header".
- GAME-DESIGN.md line 38: same change.
- New `decisions/combo-header-button.md` citing this plan. Do not edit `decisions/combo-in-build.md`.

## Do not touch

The Combo book content, its filters and cards (`comboBook` internals), combo rules in `src/sim/combos.ts`, the dock and the Menu.

## Open questions

- Does the count show found/total or active/total? Default: found/total, matching the "★ found" filter.
