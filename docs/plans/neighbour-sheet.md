# Neighbours sheet: a list, then a detail per RT

Status: approved by Hari 2026-11-01 (TODO item "HIGH PRIORITY: Revamp the Neighbours sheet", "continue" on the ranked TODO). Options: project file `plans/neighbour-options.md`, options 1A and 3A.

## Goal
The Neighbours sheet is one long scroll at 16 RTs and fails UI.md rule 13 by far (allowlist cap in `tests/e2e/ui.spec.ts`: 151 words in view, block 32, 1,202 per sheet). Hari: "absolutely not usable, need total revamp". AI RTs also carry ranking star goals the player cannot act on.

## Decisions
- AI RTs drop the `rankWins` and `winStreak` goals from their star check. The player's own RT keeps them. AI RTs still count in the area ranking (`areaScore`) and still record `n.ranking`.
- The sheet opens on a list. One row per RT: name, stars, the one blocking need, one status chip (Stalled, Building, Max). Stalled sorts first. One "Auto-fund all" control at the top.
- Tap a row for its detail: unmet goals only, Dana ×6 as the one filled button, Dana ×1, one Auto chip cycling Off, 3, 6, 12. Ambil alih and Serahkan stay in the detail for now; the build-on-AI item retires them later.
- The rule paragraphs move to a "?" help sheet. The per-RT ranking line (`grow.rank`, `grow.rankParts`, `rankLine`) goes.
- Order: T1 then T2. T2 depends on T1 being merged.

## Tasks

### T1. AI RTs have no ranking goal (Sonnet, executor trial)
- Files: `src/sim/grow.ts`, `tests/grow.test.ts`
- Exact changes: in `neighboursSystem` in `src/sim/grow.ts` (the `while (n.stars < 3)` loop near line 377), skip goals whose `kind` is `'rankWins'` or `'winStreak'` before the `every(...)` check. Export a small helper `aiGoals(goals)` that does this filter so T2 can reuse it. In `tests/grow.test.ts` add one test: an AI RT that meets every RT 2★ goal except `rankWins` gains its 2nd star.
- Done when: `npm run typecheck` and `npm test` pass, including `tests/rw.test.ts` and `tests/kel.test.ts` (the RW and Kelurahan bots still reach their stars); the new test fails without the filter; `decisions/neighbour-sheet-T1.md` and `progress/neighbour-sheet-T1.md` exist.
- Don't touch: the player's own star check, `src/data/stages.ts`, `src/ui/`, ranking maths in `src/sim/ranking.ts`, TODO.md. No e2e needed.

### T2. The sheet as a list, then a detail per RT (Sonnet, executor trial)
- Files: `src/ui/neighbours.ts`, `src/i18n/en.ts`, `src/i18n/id.ts`, `src/style.css` (only if a new row class is needed), `tests/e2e/ui.spec.ts`
- Exact changes:
  - `openNeighbours` renders a list: one tappable row per AI RT (`data-nb-row` with the cell name), showing name, stars, one blocking need (the first unmet goal from `starChecklist` after the T1 `aiGoals` filter, or "Max") and one status chip: Stalled (unfunded and no bank), Building (has banked Dana), Max (3★). Stalled rows sort first. At the top, one "Auto-fund all" chip that sets every AI RT's `autoKeep` (cycle Off, 3, 6, 12 like the per-RT chip).
  - Tapping a row opens that RT's detail in the same sheet with a back button: unmet goals only (filter out ranking goals and done lines), Dana ×6 as the only `btn primary`, Dana ×1 as secondary, one Auto chip, then the existing Ambil alih or Serahkan button.
  - Remove `rankLine` and its use. Move the rule paragraphs to a help view behind a "?" button in the sheet head. Remove i18n keys that are no longer used; add new keys in both languages, each label 6 words or fewer (UI.md rule 16).
  - In `tests/e2e/ui.spec.ts`: delete the `'neighbours'` entry from `DENSITY_ALLOW`; update the specs at "after promotion the map is bigger, neighbours show in the Menu, and funding one works" and "a tap on an AI RT opens the Neighbours panel" to tap a row before funding.
- Done when: `npm run typecheck` and `npm test` pass; `npx playwright test tests/e2e/ui.spec.ts -g "neighbours|AI RT|word and primary-button limits" --project=phone-320-id --project=phone-430-id --project=phone-412-en` passes with the `'neighbours'` allowlist entry deleted; every per-RT action is one tap from its row; `decisions/neighbour-sheet-T2.md` and `progress/neighbour-sheet-T2.md` exist.
- Don't touch: `src/sim/` (beyond importing T1's helper), funding and takeover rules, the district card (`districtCard`, `openDistrict`), other allowlist entries, TODO.md.

## Open questions
- None for these tasks. Build on AI RTs, Kunjungan and "Go to RT" wait for Hari's smaller-map decision.
