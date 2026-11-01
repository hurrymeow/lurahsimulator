# Plan: clear UI hierarchy (Wacana sheet, setup screen, rule 14)

Status: approved by Hari 2026-11-01 ("do b, and yes to the rest"). Options and diagrams: project file `plans/wacana-hierarchy-options.md`.

## Goal

Every screen shows one obvious next step, and each kind of control has its own look. Rule 13 (text density) and the new rule 14 (control roles) are checked in CI, not only on paper.

## Decisions and why

1. **Wacana becomes a list, then a detail pop-up (option B).** The sheet lists one row per policy. Tapping a row opens a pop-up with the joke line and Umumkan vs Kerjakan side by side. Why: it is the only option that passes all of rule 13 (about 30 words in view, 1 primary), and it makes "announce or do it?" the visual question.
2. **Kerjakan (Realisasi) is the primary, Umumkan is secondary.** Why: the honest choice is the loud one, the cheap one is quiet. That is the satire. When the player can't afford it, the primary stays filled but muted, with the "kurang" line under it (rule 9).
3. **The pop-up stays open after Umumkan.** Why: announcing is a repeat action. This keeps repeat announces to one tap.
4. **New UI.md rule 14, "Four roles, four looks".** Primary: filled accent, one per screen. Secondary: outline, no fill. Choice (toggle, tab, segment): accent border plus a check or underline when on, never the primary fill. Input: light field with an inset border. Section labels and headings are plain text, never a box. Why: today one accent fill marks primary buttons, selected tabs, pause and Pak/Bu, so "selected" and "go" look the same.
5. **Disabled is a state, not a style.** A disabled button keeps its role's shape, muted, never a dashed outline. Why: the dashed Realisasi button reads as a fourth button type.
6. **CI enforces rules 13 and 14.** A word-count scan and a "max 1 visible primary" check run on every sheet, home and setup, in ID in CI (EN locally). The "known fails" text becomes an allowlist in the spec. Each entry has a TODO link and a cap at today's count, so a screen can only improve.
7. **Setup screen:** the title is a plain heading. Pak/Bu is a choice segment. Fields are inputs. A dice icon (with aria-label "Acak"/"Random") replaces the "Acak" text. Mulai is the only filled button. Kembali is a small secondary link. The extra "Kampung" prefix beside the field is removed; the label "Kampungmu" stays.
8. **Perut, Kerja and Aman get stat icons.** Why: "Kerja +5" is a word where the stat-icon rule wants an icon. They follow ART.md and the existing token system (`{kerja}` etc.).

## Tasks

Order: T1 first. Then T2, T3 and T4 in parallel. T5 last.

### T1. Control roles in CSS and UI.md rule 14 (Sonnet)
- Files: `src/style.css` (`.btn`, `.btn-primary`, `.btn:disabled`, `.tabs .tab[aria-pressed]`, `#pause-btn[aria-pressed]`, `.toggle`, `.name-input`), `UI.md` (add rule 14 under Density or a new "Hierarchy" heading; checklist row), `decisions/ui-hierarchy.md` (exists, extend if needed).
- Add a `.btn-choice` (or style `[aria-pressed]` buttons) so selected = accent border plus check, never accent fill. Pause toggle and tabs move to the choice look.
- Disabled keeps role shape: `.btn-primary:disabled` is filled with a muted colour, contrast 4.5:1 (rule 4).
- Done when: no element other than `.btn-primary` uses the accent fill; disabled buttons have solid borders; typecheck, unit tests and `tests/e2e/ui.spec.ts` pass; screenshots at 320 ID and 412 EN of home, Build and Settings in the PR.
- Don't touch: layout, copy, the map or canvas drawing.

### T2. Wacana list and pop-up (Sonnet)
- Files: `src/ui/panels.ts` (`openWacana`, `realisasiPart`), the pop-up helper it should reuse (rule 8 layout), `src/i18n/en.ts` and `id.ts` (`wac.*` keys), `src/data/wacana.ts` and `realisasi.ts` only if `trade`/`effect` prose becomes icon chips, `tests/e2e/` specs that open Wacana.
- Sheet: intro of 20 words or fewer; one row per policy with name, ❤ approval meter (labelled with %), a short state for a running Realisasi, and a chevron. Razia row stays on top in the Kecamatan.
- Pop-up: joke line, then two columns: Umumkan (effects as icons, price, secondary button) and Kerjakan (effects as icons, weeks, price, primary button, "kurang" line when short). Drop the "(biaya …)" repeat. Stack the columns when they don't fit at 320px ID.
- Done when: rule 13 passes on the sheet and the pop-up at 320, 360, 412 and 430px in ID and EN (measure script); 1 primary per screen; announce and realisasi still work (existing tests green); screenshots at 320 ID and 412 EN.
- Don't touch: Wacana or Realisasi balance numbers, sim code.

### T3. Setup screen (Haiku, after T1)
- Files: `src/ui/home.ts` (lines around `titleBtn`, `dice`, `name-prefix`, `home-begin`, the Kembali button), `src/style.css` (`.home-warn` heading, `.name-row`, `.name-prefix`), the existing dice/pixel icon set in `src/ui/icons.ts`.
- Exact changes: title `p.home-warn` becomes a heading with no box; Pak/Bu buttons use the T1 choice style instead of `btn-primary`; dice buttons become icon buttons (48px, aria-label `t('name.dice')`); remove the `span.name-prefix` "Kampung"; Kembali becomes a secondary small button.
- Done when: only Mulai is filled; taps 48px with 8px gaps at 320px; the home spec passes in ID and with `--project=phone-412-en`; screenshot at 320 ID.
- Don't touch: name lists, save logic, other home screens. No refactors.

### T4. Perut, Kerja and Aman icons (Sonnet)
- Files: `src/ui/icons.ts`, the stat token code, `src/i18n/en.ts` and `id.ts` strings that name these meters, `src/data/realisasi.ts` `effect` strings.
- Three pixel icons per ART.md (no edits to the artist's sprites). Replace the words with tokens in player text.
- Done when: no player string shows "Perut", "Kerja" or "Aman" as a bare stat word next to a number; tap on the icon shows its name; i18n tests pass.
- Don't touch: meter maths.

### T5. CI scans for rules 13 and 14 (Sonnet, after T2 and T3)
- Files: `tests/e2e/ui.spec.ts` (start from project file `plans/text-density-measure.spec.ts`), `UI.md` (rule 13 "known fails" line and the checklist table rows 13 and 14).
- Scan every sheet, pop-up, home and setup: words in view (50), words per block (20), words per sheet (300), visible `.btn-primary` count (max 1). Allowlist the remaining TODO screens (Neighbours, How-to, Stats, Build tabs) with caps at today's counts and a TODO link each.
- Done when: the scan runs in CI and is green; deleting an allowlist entry for a fixed screen is the only way the list changes; UI.md says the scan exists.
- Don't touch: other specs.

## Open questions

- None blocking. If the side-by-side pop-up clips at 320px ID even when stacked, report back rather than shrinking text below 16px.
