# Pause resets the partial month on popup

- `src/ui/autopause.ts`: new pure `autoPauseStarted` rule, true only on the running-to-held transition at speed above 0.
- `src/app.ts`: the frame loop resets the month accumulator on that transition, for modals, sheets, event cards, build mode and how-to.
- Tests: unit test in `tests/autopause.test.ts`, e2e check in `tests/e2e/ui.spec.ts` (menu open resets a 7000ms partial month to 0).
- Follows the docs: strengthens the existing auto-pause rule in `decisions/auto-pause.md` and GAME-DESIGN.md section 3, no doc change needed.
