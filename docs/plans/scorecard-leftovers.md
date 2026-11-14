# Scorecard leftovers

Six TODO items under "scorecard" (claimed 2026-11-13). Road rule on for bots ships directly (driver change in its own PR). This plan holds the tasks for the DeepSeek executor. Items that need Nightly data to diagnose (remaining Fails, the 10 Unknown rows, last-RT stalls) get tasks here once the road-rule Nightly has run.

## Decisions
1. **Row 27 bar is reworded, not the pill.** `decisions/goal-line-one-goal.md` keeps have and need off the closed goal pill (UI.md rule 5, one line). So §8 item 27 passes on "current goal on screen within 5s, progress one tap away". Counter: Kairosoft shows progress without a tap. Kept anyway: a returning player needs the goal's name first, and the tap is one.
2. **Bunting follows the lomba year.** The Lomba is held every second year (#361). Bunting in a year with no Lomba tells the player a party is coming that is not.
3. **Builder bots spend Orang Dalam on the neighbour visit** so scorecard row 13 stops flagging B1 and B4.

## Tasks

### T1. Row 27 passes on a goal on screen, progress one tap away (Sonnet, executor trial)
- Files: `GAME-DESIGN.md`, `tests/scorecard/scorecard.ts`, `tests/scorecard/harness.test.ts`, `decisions/scorecard-row-27-bar.md`, `progress/scorecard-row-27-bar.md`
- Exact changes:
  1. In `GAME-DESIGN.md` §8 item 27, replace `- **Pass:** current goal and its progress on screen within 5s, in both languages.` with `- **Pass:** current goal on screen within 5s, in both languages. Its progress is one tap away (the closed goal pill stays one line; \`decisions/goal-line-one-goal.md\`).` and replace `- **Bad:** resume on a menu, or with no goal shown.` with `- **Bad:** resume on a menu, with no goal shown, or with the goal's name cut off.`
  2. In `tests/scorecard/scorecard.ts` around line 481 to 487, delete the `hidden` const and both `progress-on-screen` branches, so row 27 is `add(27, 'Coming back', 'T2', r.verdict, r.evidence)`. Update the check text to say the goal line, not progress.
  3. In `tests/scorecard/harness.test.ts` around lines 76 to 86, change the row 27 test so a `progress-on-screen` of `false` still yields Pass when the T2 spec passes. Keep the parse assertion on `notes`.
  4. Write `decisions/scorecard-row-27-bar.md`: the bar changed, why, the counter-argument above.
- Done when: `npm run typecheck` and `npx vitest run tests/scorecard/harness.test.ts` pass; `decisions/scorecard-row-27-bar.md` and `progress/scorecard-row-27-bar.md` exist.
- Don't touch: `src/`, `tests/e2e/`, i18n, TODO.md. No refactors. No e2e needed.

### T2. Agustusan bunting only in a lomba year (Sonnet, executor trial)
- Files: `src/sim/lomba.ts`, `tests/lomba.test.ts`, `decisions/agustusan-lomba-year-T2.md`, `progress/agustusan-lomba-year-T2.md`
- Exact changes:
  1. In `src/sim/lomba.ts` line 159, change `agustusan` to also require a lomba year: add `&& year(s) % LOMBA.everyYears === 0` using the same `year` helper and the same condition as the announce line in `lombaSystem`. (If the day is at the start of the next year, check which year `weeksToDay` points to and use that year.)
  2. In `tests/lomba.test.ts` add one test: `agustusan` is true in weeks 24 to 31 of a lomba year (`yearsDone` 0) and false in the same weeks of `yearsDone` 1.
- Done when: `npm run typecheck`, `npm test` and `npx vitest run tests/lomba.test.ts` pass; `decisions/agustusan-lomba-year-T2.md` and `progress/agustusan-lomba-year-T2.md` exist.
- Don't touch: `src/render/map.ts`, prizes, i18n, TODO.md. No refactors. No e2e needed.

### T3. Builder bots spend Orang Dalam on the neighbour visit (Sonnet, executor trial)
- Files: `tests/scorecard/driver.ts`, `tests/scorecard/scorecard.ts`, `decisions/scorecard-visit-odn-T3.md`, `progress/scorecard-visit-odn-T3.md`
- Exact changes:
  1. In `tests/scorecard/driver.ts` find where the bots call the neighbour visit, or add the call to the builder and shopkeeper plans (`playPlan`, near the other quarterly actions): when `visitNeighbour` (`src/sim/grow.ts` ~line 275 to 291) returns no error and `s.res.orangDalam >= NEIGHBOUR.visitOd`, visit the next neighbour RT.
  2. In `tests/scorecard/scorecard.ts` item 13, drop the bot-gap line for B1 and B4 only if their `odn` column now falls during the run in a local run of `npx vitest run tests/scorecard/harness.test.ts`; otherwise leave the line.
- Done when: `npm run typecheck` and `npx vitest run tests/scorecard/harness.test.ts` pass; `decisions/scorecard-visit-odn-T3.md` and `progress/scorecard-visit-odn-T3.md` exist.
- Don't touch: `src/`, TODO.md, other bots' plans. No refactors. No e2e needed.

### T4. Row 14 checks the builder's cash only (Sonnet, executor trial)
- Files: `tests/scorecard/scorecard.ts`, `tests/scorecard/harness.test.ts`, `decisions/scorecard-row-14-idle-debt.md`, `progress/scorecard-row-14-idle-debt.md`
- Why: the idle bot's cash falls to -40M by design. After the grace weeks `safetyNet` in `src/sim/tick.ts` stops resetting cash to 0 and drains Popularitas instead. The recorder is right. A player who builds nothing is meant to feel the drain, so the debt is not a cash-health fault.
- Exact changes:
  1. In `tests/scorecard/scorecard.ts` item 14 (around lines 310 to 315), drop the `ni` constant and the `ni >= 0` term from the verdict. Keep `nb >= 0`. Change the evidence text to `Lowest cash: builder X.XM. Idle debt is by design: after the grace weeks broke drains Popularitas (safetyNet).`
  2. If `tests/scorecard/harness.test.ts` asserts on the idle figure in the item 14 text, update it. Do not add tests otherwise.
  3. Write `decisions/scorecard-row-14-idle-debt.md`: the bar changed and why. Counter: unbounded debt could mean the sim needs a floor; kept open, since the Popularitas drain already stops the player from idling.
- Done when: `npm run typecheck` and `npx vitest run tests/scorecard/harness.test.ts` pass; both new files exist.
- Don't touch: `src/`, TODO.md, other rows. No refactors. No e2e needed.
