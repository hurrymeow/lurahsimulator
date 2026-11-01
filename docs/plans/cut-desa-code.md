# Remove the Desa path from the code

Status: approved by Hari 2026-11-01 ("continue" on the ranked TODO). Desa was cut on 2026-10-31 (`decisions/cut-desa.md`), but the RW SK still offers it.

## Goal
No Desa button, path, building, job, combo, title or string remains in `src/`. A save on the Desa path loads as incompatible (start-new prompt). No save migrations.

## Decisions
- Do not bump `SAVE_VERSION`: that would drop every save. `load` in `src/sim/save.ts` returns null only for a save with `stage.path === 'desa'`.
- Keep the `path` field with the single value `'kelurahan'`, so other code needs no change. The SK sheet shows one accept button.
- Remove the Desa-only buildings (`balaiDesa`, `bumdes`, `desaWisata`, `sawahIrigasi`, `embung` and every other building with a `D0`/`D1`/`D2` gate), their combos, the `pendampingDesa` job, `DESA_TITLES`, the Dana Desa rule in `src/sim/kel.ts` and their sprites. Before deleting a building, check no Kelurahan-path building, combo or goal names it.

## Tasks

### T1. Cut the Desa path (Sonnet, executor trial)
- Files: `src/ui/stage.ts`, `src/app.ts`, `src/data/higher/kelurahan.ts`, `src/data/higher/stages.ts`, `src/data/higher/types.ts`, `src/data/jobs.ts`, `src/sim/kel.ts`, `src/sim/stages.ts`, `src/sim/types.ts`, `src/sim/save.ts`, `src/render/art-higher.ts`, `src/render/people.ts`, `src/i18n/en.ts`, `src/i18n/id.ts`, `src/i18n/higher-id.ts`, `tests/kel.test.ts`, `tests/rw.test.ts`, `tests/grow.test.ts`, `tests/e2e/ui.spec.ts`
- Exact changes: remove the `sk-accept-desa` button and `stage.acceptDesa`; drop `'desa'` from `Path`, `accept`, `acceptSK`, `stageTitle` and `GameState.stage.path`; delete the Desa gates, buildings, combos, job and titles listed in Decisions; delete `NO_PENDAMPING` and its use in `src/sim/kel.ts`; reword `stage.pathBody` in both languages to describe the Kelurahan only, or remove it if the SK sheet no longer needs it; add the `stage.path === 'desa'` check in `load`. Delete or rewrite tests that play the Desa path, including the e2e spec "the RW SK offers Kelurahan or Desa, and the Desa path opens its build menu" (rewrite it as "the RW SK offers the Kelurahan").
- Done when: `npm run typecheck` and `npm test` pass; `git grep -n -i -E "desa\b|'desa'|Desa" src` returns nothing except words that only contain the letters (for example "mendesak"); a unit test shows a save with `stage.path: 'desa'` loads as null; `npx playwright test tests/e2e/ui.spec.ts -g "RW SK" --project=phone-320-id --project=phone-412-en` passes; `decisions/cut-desa-code.md` and `progress/cut-desa-code.md` exist.
- Don't touch: Kelurahan-path buildings and balance numbers, `SAVE_VERSION`, GAME-DESIGN.md, the artist's sprites, TODO.md.
