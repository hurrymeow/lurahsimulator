# Scorecard T2 specs

## Goal
Give scorecard rows 3 (growth shows on the map), 6 (causes are legible) and 27 (coming back) real evidence from the running app. Source: `decisions/scorecard-calls.md`, TODO "Scorecard follow-ups from the 2026-11-07 calls". Hari's standing go (2026-11-07): dispatch to the DeepSeek executor.

## Tasks

### T1. Three scorecard specs in one file (Sonnet, executor trial)
- Files: `tests/e2e/scorecard-t2.spec.ts`, `decisions/scorecard-t2-specs.md`, `progress/scorecard-t2-specs.md`
- Exact changes: add one new spec file. Import `test` and `expect` from `./fixtures` and copy the small `lang`, `start` and `passHome` helpers from the top of `tests/e2e/ui.spec.ts` (do not edit `ui.spec.ts`). Start the game with `/?debug&lang=<lang>`; the app is exposed as `window.pakrt`. Three tests:
  1. `row 27: coming back` — start a new game, place one building through the app's own state or UI, call `window.pakrt.save()`, reload, pass the home screen with Continue, wait 5 seconds, then assert the same building count and resident count as before the reload. Run `scanLegibility` from `./legibility` on the screen at 5s and expect no problems. Attach a screenshot with `testInfo.attach`; do not use `toHaveScreenshot`.
  2. `row 6: a Popularitas fall names its cause` — read `src/sim/warnings.ts` and `src/sim/tick.ts` (the `SABAR_CAUSE` map) to find how the first fall is announced. Force one fall with the debug hook (lower `window.pakrt.state.res.sabar` source, or add a cause the way the code does), advance the game by the needed weeks, and assert the visible notice or log line names the cause in words of the current language. Use text from `src/i18n/`, not a hard-coded sentence.
  3. `row 3: the map grows with each star` — use the developer-seed route that `ui.spec.ts` already uses to arm RT 1★, 2★ and 3★ (search `developer seed`), and count the building sprites the map draws at each star (read `src/render/map.ts` for the list it draws from). Assert the count strictly rises from 1★ to 3★.
- Done when: `npm run typecheck` and `npm test` pass; `npx playwright test tests/e2e/scorecard-t2.spec.ts --project=phone-412-id` and `--project=phone-412-en` pass; `decisions/scorecard-t2-specs.md` says what each test reads and what it cannot prove; `progress/scorecard-t2-specs.md` exists. If a test needs a new debug hook in `src/`, set status `stopped` and name the hook instead of adding it.
- Don't touch: `src/`, `tests/e2e/ui.spec.ts`, `tests/scorecard/`, `scorecard/`, TODO.md, any snapshot. Do not run the full e2e suite.
