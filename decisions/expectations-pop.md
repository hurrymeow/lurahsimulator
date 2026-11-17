# Every Popularitas fall shows its cause: the expectations drain pops at the Kantor

TODO item "Fix the remaining scorecard Fails that have a clear cause" (taken over 2026-11-17), the scorecard thread's next-plan step 4: "Row 6: find the one uncaused Popularitas drop" (`decisions/scorecard-bot-fixes-nightly.md`).

## Cause
GAME-DESIGN.md §8 item 6 counts a weekly Popularitas fall of more than 2 as legible when the tick logged a cause: a number pop or a bad notice. Traced on the drops the bots logged without one (idle seed 1 weeks 26 and 29, shopkeeper seed 4 week 25, Pencitraan seed 2 week 36, random seeds 4 and 6): in each, `expectations` took 1.5 to 5.5 Popularitas and `needsSystem` (hunger) up to 0.6, and neither left a mark. `expectations` called `gain` with no tile, so it never popped; hunger pops at the Kantor but is often under the 0.5 pop floor.

## Fix
`expectations` passes the Kantor to `gain`, so its drain shows as a heart pop there. Pops on the same tile merge in `handleFx`, so a week with both drains shows one number. `decisions/calm-income-pops.md` (Hari) keeps hearts with both signs on the map; only money pops are earnings-only. No sim number changes.

## Checks
- `tests/expectations-pop.test.ts`: the drain pushes a sabar pop at the Kantor equal to the fall.
- Idle, random, shopkeeper and Pencitraan bots, seeds 1 to 10: **0 of 3,399** Popularitas drops over 2 lack a cause (before: 16 in 6 seeds of the same bots). Star times cannot move: only effects were added.
- `npm test`, and the pop and legibility e2e specs at 360 id and 412 en: 705 unit tests and 104 e2e tests pass.

Verdict: self-approved under the TODO rule. Row 6 should read 0 uncaused drops on the next Nightly.
