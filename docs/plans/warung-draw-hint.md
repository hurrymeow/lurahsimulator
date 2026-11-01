# Stop the built Warung Sembako draw hint

## Goal
The goal strip kept saying "build Warung Sembako" after the player had built one. Source: TODO.md "Stop the 'build Warung Sembako' hint after Warung Sembako is built". Cause: `bestDraw` in `src/sim/nextstep.ts` ranks buildings with `ignoreLimit: true` and never checks whether the player already owns one.

## Decisions
- Scope is only the cause: `bestDraw` skips any building the player already has (`count(s, d.id) > 0`), so the hint names the best draw they do not own yet. When none is left it returns null and `nextStep` falls through to null, so the goal line shows alone.
- Not in scope: naming the pop cap as the blocker (a wording and design call for Hari), and the goal strip layout. The Stempel hint work (`docs/plans/stempel-goal-actionable.md` T2) also edits `nextstep.ts`; this task touches only `bestDraw`.

## Tasks

### T1. bestDraw skips buildings already built (Sonnet, executor trial)
- Files: `src/sim/nextstep.ts`, `tests/nextstep.test.ts`
- Exact changes: in `bestDraw` in `src/sim/nextstep.ts` add `&& count(s, d.id) === 0` to the `placeableDefs().filter(...)` condition (`count` is already imported). In `tests/nextstep.test.ts` add one test beside "says what draws residents when beds are free but nobody comes": build a Warung Sembako, set the state so beds are free but `population >= attractTarget`, and assert that `nextStep(s)` is not a `draw` step naming Warung Sembako (it names another building or is null).
- Done when: `npm run typecheck` and `npm test` pass; the new test fails without the `count` condition and passes with it; the existing draw test still passes; `decisions/warung-draw-hint-T1.md` and `progress/warung-draw-hint-T1.md` exist.
- Don't touch: strings, `src/ui/`, other steps in `nextStep`, other tests, TODO.md, anything for the Stempel goal. No e2e needed.
