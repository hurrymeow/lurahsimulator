# Plan: fix every screen that fails the UI audit of 2026-11-01

Status: approved by Hari 2026-11-01 ("plan fix for everything and add to todo"). Audit: project file `audit/ui-rules-2026-11-01/report.md` (screenshots per width and language beside it). Rules: UI.md 5, 7, 10, 13 to 17.

## Goal

Every screen passes UI.md at 320, 360, 412 and 430px in EN and ID, and CI proves it.

## What is already planned elsewhere

| Fail | Covered by |
| --- | --- |
| Rule 14 on setup, dock, Build and Warga tabs, Settings choices | `docs/plans/ui-hierarchy.md` T1 (PR #225) and T3 |
| Wacana (rules 13, 14) | `docs/plans/ui-hierarchy.md` T2 |
| Goal pill (rules 5, 16) | `docs/plans/goal-line-one-goal.md` |
| CI word-count and one-primary scan | `docs/plans/ui-hierarchy.md` T5 |

This plan covers everything else, and adds to T5.

## Decisions and why

1. **Event choices are all secondary.** A choice between alternatives has no "step forward", so rule 14 gives none of them the primary fill. The result pop-up's single "OK"-style button stays primary. Why: today 2 of 3 choices are filled, which tells the player which one to pick.
2. **Toasts lead with the fact in 8 words or fewer.** Rule 16 covers tappable notices too. Example: "Bu Fajar pindah: ❤ di bawah 15" instead of the full sentence. The full line stays in the Log. Why: the toast is tappable and was 12+ words.
3. **Combo card effects fit in 2 lines with no clamp.** The effect is rewritten, not cut. `data-clamp` support is removed from the code and from the legibility scan once the goal pill also stops clamping. Why: rule 5 now has no exceptions.
4. **Lists show one line per row; detail opens on tap.** Applies to Build cards, Staff, Neighbours and Stats. Why: rule 13; the detail screen is the second disclosure level, which rule 13 allows.
5. **The opener is one idea per card, 20 words or fewer each.** Long explanations move to How to Play. Why: rule 7; today the opener shows 95 to 113 words.
6. **The expanded goal list closes when a sheet opens.** Why: in the audit it stayed open over every sheet after one tap. Verify first; it may be a crawl artefact.

## Tasks

Order: T6 to T9 can run in parallel with the hierarchy plan. T10 waits for T6 to T8 and for hierarchy T5. T11 runs last.

### T6. Build cards: one line per card (Sonnet)
- Files: `src/ui/build*.ts` or wherever Build cards render (grep `dimiliki` / `owned`), `src/style.css`, i18n keys for card text.
- Each card: icon, name, price, owned count, one effect line in stat icons. The blurb, size, permit and combo notes move to the building detail (tap the card's info or long-press, reuse the existing building panel).
- Done when: every Build tab shows 50 words or fewer in view and 20 or fewer per card at 320 to 430px in EN and ID; the tab holds 300 words or fewer; placing still works (`tests/e2e/ui.spec.ts` build specs green).
- Don't touch: prices, unlocks, the Combo book button.

### T7. Neighbours, Stats and Staff: rows plus detail (Sonnet)
- Files: the Neighbours, Stats and Staff sheets in `src/ui/` (grep `openNeighbours`, `openStats`, `openStaff`), i18n keys.
- Neighbours: one row per RT (name, ★, one status chip); explainer paragraphs move behind a "How it works" detail. Stats: headline numbers as icon rows; explainers behind a tap. Staff: one line per person (portrait, name, role, level); stats and actions in the person's detail.
- Done when: each sheet passes rule 13 (50 in view, 20 per block, 300 per sheet) at all widths in EN and ID; existing specs for these sheets green.
- Don't touch: sim maths, staff actions' behaviour.

### T8. Opener, How to Play and toasts (Sonnet)
- Files: the opener and How-to (`src/ui/howto.ts`, tutorial tip data), toast strings in `src/i18n/en.ts` and `id.ts` (`sim.movedOut` and siblings), `src/ui/` toast renderer if it joins strings.
- Opener: at most 3 cards, one idea each, 20 words or fewer. How-to pages: one idea each, 50 words in view.
- Toasts: fact first, 8 words or fewer, stat icons; full sentence still in the Log.
- Done when: rules 7, 13 and 16 pass on the opener, How-to and every toast type (list them in the PR); tutorial specs green in EN and ID.
- Don't touch: tutorial tap lock (#220), tip timing.

### T9. Events and Combo cards (Haiku)
- Files: event pop-up renderer (grep `card event` in `src/ui/`), `src/ui/lists.ts` line with `data-clamp': '2'`, combo effect strings in `src/data/` combos.
- Exact changes: event choice buttons use `.btn` (secondary), not `.btn-primary`; the result button stays primary. Remove `data-clamp` from the Combo effect span and shorten any effect that runs past 2 lines at 320px ID.
- Done when: 0 primary buttons on an event choice card; no Combo card clamps at 320px ID; event and Combo specs green; `--project=phone-412-en` run for the touched specs.
- Don't touch: event outcomes, combo maths, the goal pill clamp (goal-line plan). No refactors.

### T10. Rule checks in CI (Sonnet, extends hierarchy T5)
- Files: `tests/e2e/ui.spec.ts`, `tests/e2e/legibility.ts`, a canvas test file for rule 17, `UI.md` table.
- Add: rule 10 (at each tutorial step, tap outside the target, assert no state change); rule 15 (list each tab set and its item type, fail on a mixed set); rule 16 (pills, chips, buttons and toasts at 6 to 8 words, card rows excluded); rule 17 (place each building type on a clear map, diff neighbouring tiles before and after). Remove the `data-clamp` skip from the legibility scan once the goal pill and Combo cards stop clamping.
- Done when: the checks run in CI and pass, or fail only on allowlisted screens with a TODO link.
- Don't touch: other specs.

### T11. Re-audit (Sonnet)
- Rerun the crawl in the project files (`audit/ui-rules-2026-11-01/audit.spec.ts`) at 320, 360, 412 and 430px, EN and ID, in light and dark theme, on the RT, Kelurahan and Kecamatan seeds.
- Done when: a new report in the project files shows every screen passing, or lists the remaining fails as TODO items.

## Open questions

- None blocking. If a Build card can't fit one effect line at 320px ID with icons, report back with the worst case rather than shrinking text.
