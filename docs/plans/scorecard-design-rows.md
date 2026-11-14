# Scorecard design rows 8, 12, 13, 15 and 18

Goal: give rows 8, 12, 15 and 18 a fix path, and fix the item 12 and 13 readers. Evidence: Nightly run 43581598916 (`decisions/scorecard-design-calls-nightly.md`), a read of the 9 flagged events in `src/data/eventsMore.ts` and `src/data/eventsStaff.ts`, and the star data in `src/data/stages.ts` and `src/data/higher/stages.ts`. Runs after `docs/plans/scorecard-bot-fixes.md`.

## Decisions

1. **Row 18 is a reader gap, not content.** All 9 flagged options lose only because the reader drops two things. It ignores `incomePct` inside rolled outcomes (Part Time, CCTV, Atap Bocor and the Hibah booking all carry an income swing). It also counts more Viral as better, but Viral cuts both ways: it gives free repairs and chain steps, and it raises judol starts and inspection risk. With both read, none of the 9 is dominated. Fix the reader (T1); no event changes. Counter: a risk-neutral player always takes the gamble. Accepted, because variance is the cost a decline avoids, and the bar asks only for strict domination.
2. **Row 12 reader counts what the game gives.** It misses `PATH_UNLOCKS` (Kel 2★ opens Terminal and Taman) and the SK that every 3★ with a next stage brings. The SK opens a new map, the biggest system in the game, so it counts as a new system (T2).
3. **Row 12 content: thin stars get a Rupiah grant.** After T2, RW 3★ and Kel 3★ have the SK only, Kel 2★ has buildings only, and Kec 1★ to 3★ have one kind or none. Each gets a Rupiah `reward` (T4), which adds a kind without new art. It was Orang Dalam at first, but T2 showed Orang Dalam already goes unspent in B3 and B4 (row 13), so more of it would pile up. Rupiah always has a sink. Kec 2★ and 3★ stay at one kind after T4. Their second kind waits for Kecamatan slice 2, because that slice waits on the hands-on playtest and moving Kecamatan unlocks would change the pinjol balance under test. Row 12 stays Fail on those two stars, named in the row.
4. **Row 13 checks the Orang Dalam sink from B2** (T2). T5 of the last plan showed the only RT 1★ permit kind is too dear for B1.
5. **Row 8 counts the step strip as a short goal.** Section 8 says short is "this month's build or event". The Now and Next strip names that build, and finishing it is a short goal the player sees. Today only checklist lines count, and they land every 2 to 9 min, so short reads 35%. T3 records a `step` event when the strip's step changes kind or text, and the short horizon counts it. Counter: this could flatter the row. The strip is on screen and is what a player acts on, so it is the honest reading. If short is still under 90% after T3, the next plan adds checklist lines.
6. **Row 15: RW prices step up with RW income.** Income grows 6.67x from RT to RW while key costs barely move (bar 0.7 to 1.5). The old RT map keeps paying in at RW, which row 24 wants. So the fix is prices, as Kairosoft resets "dear" per office tier. T5 measures the ratio, then scales the cost of every RW-scope building by one factor that brings it to about 1.2. Counter: dearer RW slows RW 2★, and row 10 already fails on a slow RW 2★ for the shopkeeper. T5 has a guard: builder RW 2★ no more than 2 min later on seeds 1 to 3. If the guard fails, T5 stops at the largest factor that passes and records the gap.

No decision changes a goal line, so none goes to Hari. T4 and T5 change game data; both are inside the section 3 targets.

## Tasks

Every task: put any local measuring in `tests/scorecard/measure-<task>.test.ts`. That path is in each task's Files, so the gate accepts it; the reviewer deletes it. Use only that one scratch file. vitest hides console output: write numbers to a file under `/tmp` in `afterAll`.

Run one at a time on the executor, in order T1, T2, T3, T4, T5. Each starts from main after the earlier one merges. After T5 merges, run Nightly and re-judge rows 8, 12, 13, 15 and 18.

### T1. Item 18 reads income swings and two-sided Viral (Sonnet, executor trial)
- Files: `tests/scorecard/measure-T1.test.ts`, `tests/scorecard/scorecard.ts`, `tests/scorecard/harness.test.ts`, `GAME-DESIGN.md`, `decisions/scorecard-design-rows-T1.md`, `progress/scorecard-design-rows-T1.md`
- Exact changes:
  1. In item 18's `gain`, add each outcome's `incomePct` (weighted by `weight / total`) to a key `income`. Add a top-level `c.incomePct` to `income` too, and drop the `!c.incomePct` filter on `options`.
  2. Viral is two-sided: when `ga.viral` and `gb.viral` differ, the pair is not comparable, so neither dominates. Leave the `viral` key out of `geq` and `gt` otherwise.
  3. Harness test: an option with a mean `sabar` gain and a 40% `incomePct: -0.05` outcome is not dominated by a flat `sabar: -1` decline, and vice versa.
  4. In `GAME-DESIGN.md` §8 item 18 Evidence, after `T1 data check on event options.` add ` Rolled outcomes count by their weighted mean, income swings included. Viral cuts both ways, so a Viral difference is a trade.`
- Done when: typecheck and `npx vitest run tests/scorecard/harness.test.ts` pass. Write the list of options item 18 now flags (expected: none of the 9 above) in the progress file.
- Don't touch: `src/`, event data, TODO.md, `tests/e2e/`. No refactors. No e2e needed.

### T2. Item 12 reads path unlocks and the SK; item 13 checks Orang Dalam from B2 (Sonnet, executor trial)
- Files: `tests/scorecard/measure-T2.test.ts`, `tests/scorecard/scorecard.ts`, `tests/scorecard/harness.test.ts`, `GAME-DESIGN.md`, `decisions/scorecard-design-rows-T2.md`, `progress/scorecard-design-rows-T2.md`
- Exact changes:
  1. In item 12, add `PATH_UNLOCKS[stage].stars[i]` (from `src/data/higher/stages`) to the unlocks of star `i + 1` for each stage that has a path entry.
  2. In item 12, a 3★ counts as a new system when the stage has a next stage (`stageDef(id).next` or the field the code uses for the SK).
  3. In item 13, judge the Orang Dalam sink from B2, not B1. Say "from B2 (decisions/scorecard-design-calls-T5.md)" in the evidence text.
  4. In `GAME-DESIGN.md` §8 item 13 Pass, add ` Orang Dalam is judged from B2, because the first permit kind is too dear for B1 (decisions/scorecard-design-calls-T5.md).`
  5. Harness tests for 1 and 2.
- Done when: typecheck and `npx vitest run tests/scorecard/harness.test.ts` pass. Write each star's kind count before and after in the progress file (a local run of the scorecard readers on builder seeds 1 to 3 is enough).
- Don't touch: `src/`, TODO.md, `tests/e2e/`. No refactors. No e2e needed.

### T3. Item 8 counts the step strip as a short goal (Sonnet, executor trial)
- Files: `tests/scorecard/measure-T3.test.ts`, `tests/scorecard/driver.ts`, `tests/scorecard/scorecard.ts`, `tests/scorecard/harness.test.ts`, `GAME-DESIGN.md`, `decisions/scorecard-design-rows-T3.md`, `progress/scorecard-design-rows-T3.md`
- Exact changes:
  1. Add a `step` TLEvent. In `runBot`, after `tick(s)`, read `nextStep(s)`; when its `kind` or `text` differs from the last tick's, push `{ t, kind: 'step' }`. Skip tick 0.
  2. In item 8, the short horizon counts `step` events as well as checklist-line events, with the same 2 min window.
  3. In `GAME-DESIGN.md` §8 item 8 Good, replace `the next star line (short)` with `the next star line or the Now strip's step (short)`.
  4. Harness test: a timeline with only `step` events every 90 s passes the short horizon.
- Done when: typecheck and `npx vitest run tests/scorecard/harness.test.ts` pass. Write builder seeds 1 to 3 short-horizon share before and after in the progress file.
- Don't touch: `src/`, TODO.md, `tests/e2e/`. No refactors. No e2e needed.

### T4. Thin stars give a Rupiah grant (Haiku)
- Files: `src/data/higher/stages.ts`, `tests/scorecard/measure-T4.test.ts`, `decisions/scorecard-design-rows-T4.md`, `progress/scorecard-design-rows-T4.md`
- Exact changes:
  1. In `src/data/higher/stages.ts`, add a `reward` in the same shape as RT 1★ in `src/data/stages.ts`: RW 3★ `{ rupiah: 5_000_000 }`, Kelurahan 2★ `{ rupiah: 10_000_000 }`, Kelurahan 3★ `{ rupiah: 15_000_000 }`, Kecamatan 1★, 2★ and 3★ `{ rupiah: 20_000_000 }`. If a star already has a `reward`, add the `rupiah` key to it.
- Done when: `npm run typecheck` and `npm test` pass. Any unit test that pins those star rewards is updated in the same commit only if it is in Files; if it is not, stop and report the test name.
- Don't touch: unlock lists, goals, `PROMOTION_UNLOCKS`, i18n, TODO.md. No refactors. e2e runs in CI.

### T5. RW-scope prices step up with RW income (Sonnet, executor trial)
- Files: `src/data/higher/rw.ts`, `tests/scorecard/measure-T5.test.ts`, `decisions/scorecard-design-rows-T5.md`, `progress/scorecard-design-rows-T5.md`
- Exact changes:
  1. Measure item 15's income-growth to cost-growth ratio from RT to RW on builder seeds 1 to 3 (use the item 15 code in `scorecard.ts` on local `runBot('builder', seed, 700)` timelines).
  2. Pick one factor `f = ratio / 1.2`, rounded to 0.5 and capped at 4. Multiply the `cost` of every building in `src/data/higher/rw.ts` by `f`, rounded to the nearest Rp 100,000. Leave event and job costs as they are.
  3. Guard: builder RW 2★ on seeds 1 to 3 is no more than 2 min later than before. If it is, lower `f` by 0.5 until the guard passes, and record the gap left in the decisions file.
- Done when: `npm run typecheck` and `npm test` pass. Write the ratio before and after, the factor, and builder RW 1★, 2★, 3★ minutes before and after in the progress file.
- Don't touch: RT or Kelurahan data, goals, `src/sim/`, i18n, TODO.md. No refactors. e2e runs in CI.

## Open questions
- Kec 2★ and 3★ second kind: decide with Kecamatan slice 2.
