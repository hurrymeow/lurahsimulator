# Executor Sonnet batch

## Goal
Three Sonnet-tier tasks routed to the DeepSeek executor as a second trial (Hari, 2026-11-01: "try routing more sonnet level task to deepseek"). Each has exact files and a test as the done-check. Opus or Sonnet reviews the full diff before merge. Sources: TODO.md "UI from the SK 2 playtest" (Wifi road), "Dense housing pays", and the 25-word blurb rule (Hari, 2026-10-27).

## Tasks

### T1. Wifi Tower needs no road (Sonnet, executor trial)
- Files: `src/sim/types.ts`, `src/data/buildings.ts`, `src/sim/access.ts`, `tests/access.test.ts`
- Exact changes: add an optional `roadless?: boolean` to `BuildingDef` in `src/sim/types.ts`. Set `roadless: true` on the `wifi` building in `src/data/buildings.ts`. In `src/sim/access.ts` make `needsRoad` return false when the building's def has `roadless`. In `tests/access.test.ts` add one test: with the road rule on, a Wifi Tower placed with no path beside it is not `noRoad` and is working, while a `warung` in the same spot is `noRoad`.
- Done when: `npm run typecheck` and `npm test` pass; the new test fails without the `needsRoad` change and passes with it; `decisions/executor-sonnet-batch-T1.md` and `progress/executor-sonnet-batch-T1.md` exist.
- Don't touch: other buildings, strings, placement rules, TODO.md. No e2e needed.

### T2. Dense housing numbers (Sonnet, executor trial)
- Files: `src/data/buildings.ts`, `src/data/shops.ts`, `tests/house-levels.test.ts`, `tests/content-shops.test.ts`, `tests/stages.test.ts`, `tests/e2e/ui.spec.ts`
- Exact changes: Hari approved the balance change (2026-11-01). Rumah `housingLevels` from `[3, 5, 7]` to `[3, 4, 5]`. Kos-kosan (`kosan`): `housing: 10` and add `housingLevels: [10, 14]`. Kontrakan (`kontrakan` in `src/data/shops.ts`): `housing: 24` and add `housingLevels: [24, 32]`. Update the bed-count expectations in the four named test files to the new numbers and nothing else. In `tests/stages.test.ts` the `late-RT content` test `Kos-kosan houses 8` becomes `Kos-kosan houses 10` and expects `before + 10`. In `tests/e2e/ui.spec.ts` (the `level art and menu icons` test) the bed table `{ rumah: [3, 5, 7] }` becomes `{ rumah: [3, 4, 5] }`, level 2 reads `Houses 4 residents` / `Menampung 4 warga` and `/4`, and the upgrade diff reads `4 → 5`. Do not run the e2e spec; CI does. Keep the comment above Rumah `housingLevels` true (level 2 and 3 add 1 bed each).
- Done when: `npm run typecheck` and `npm test` pass, including the balance and bot tests, with no change to any test other than the four named files; `decisions/executor-sonnet-batch-T2.md` states which expectations moved. If any other test fails, set status `stopped` with its name. If a balance, pacing or bot test fails because of the new numbers, set status `stopped` with the failing test names and numbers. Do not edit those tests.
- Don't touch: costs, income, `maxCount`, strings, the building panel, saves, TODO.md. No e2e needed.

### T3. Test the 25-word blurb limit (Sonnet, executor trial)
- Files: `tests/blurb-length.test.ts`
- Exact changes: add one new test file. For every building definition (`src/data/buildings.ts`, `shops.ts`, `decor.ts`, `farm.ts`, `facilities` if present, and `src/data/higher/`), take the blurb as the game shows it in English and in Indonesian, and assert it has at most 25 words. Find the right lookup by reading how `src/i18n/index.ts` and the building panel resolve a blurb. Do not edit any string or other file.
- Done when: `npm test` passes with the new file. If any existing blurb is over 25 words, set status `stopped`, list each one with its word count and language in the report, and leave the test in place failing so the list is visible.
- Don't touch: any string, any other test, TODO.md. No e2e needed.
