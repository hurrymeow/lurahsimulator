# Lomba Agustusan every second year

## Goal
The Lomba Agustusan returns every 6.4 min (one game year), bar 10 min apart (scorecard row 22, `decisions/scorecard-calls.md`). Hold it every second year: `yearsDone` 0, 2, 4 (game years 1, 3, 5), so the first one stays at month 19. Source: TODO "Scorecard follow-ups from the 2026-11-07 calls", part 1.

## Decision
GAME-DESIGN.md §8 item 22 asks for big days at least 10 min apart. Every second year gives 12.8 min. Counter: the Lomba is the best set piece the game has, and skipping a year means a quieter August. Kept: the prep card, the day and the trophy are unchanged in a lomba year, and the quiet year is not announced as a loss (no Popularitas penalty).

## Tasks

### T1. Lomba only in odd game years (Sonnet, executor trial)
- Files: `src/data/lomba.ts`, `src/sim/lomba.ts`, `tests/lomba.test.ts`, `tests/scorecard/scorecard.ts`
- Exact changes:
  1. In `src/data/lomba.ts` add to `LOMBA` after `fromMonth`: `/** The lomba is held every this many years, starting in the first year (`yearsDone` 0). */ everyYears: 2,`.
  2. In `src/sim/lomba.ts` `lombaSystem`, add `&& year(s) % LOMBA.everyYears === 0` (answer to issue #360: lomba years are `yearsDone` 0, 2, 4; existing tests stay unchanged) to the announce condition (the `if (wk === LOMBA.announceWeek && ...` line). No announce in a skipped year means `s.lomba` stays last year's, `lombaPrep` returns null (year differs) and the day step returns early on `l.year !== year(s)`. Check that no skipped-year path costs Popularitas.
  3. In `tests/scorecard/scorecard.ts` item 22, set `bigDayGapMin` to `(WEEKS_PER_YEAR * LOMBA.everyYears * SECONDS_PER_TICK) / 60`, and word the line "the Lomba comes every ${...} min" the same way.
  4. In `tests/lomba.test.ts` add one test: with `newGame(1)`, month 67 (`yearsDone` 1, week 19) creates no `s.lomba` and fires no notice; month 115 (`yearsDone` 2, week 19) creates it. Check the existing tests still pass; fix only a test that assumes a lomba in year 2.
- Done when: `npm run typecheck` and `npm test` pass; `npx vitest run tests/lomba.test.ts` passes; `decisions/lomba-every-second-year-T1.md` and `progress/lomba-every-second-year-T1.md` exist.
- Don't touch: prizes, contests, prep UI, i18n, the Agustusan decorations, TODO.md. No refactors. No e2e needed.
