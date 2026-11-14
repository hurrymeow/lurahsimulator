# Scorecard bot fixes

Goal: fix the four bot faults that the design-call tasks found, so the Nightly scorecard judges the game and not the bots. Evidence: `decisions/scorecard-design-calls-nightly.md` (next plan items 1 to 4), `decisions/scorecard-design-calls-T5.md` and `decisions/scorecard-design-calls-T13.md`. Item 5 of that list (design work for rows 8, 12, 15 and 18) is a planning call and is not in this plan.

## Decisions

1. **The builder saves for its combo before its generic list.** With the generic list off, builder RT 2★ fell from about 9 to about 5 min on seeds 1 to 3 (T5). A player who reads the checklist builds the combo first. Counter: a real player also buys shops. Kept, because the core order (Pos Ronda, Warung, WiFi), beds and drains still run, and the gate only holds while a combo line is open.
2. **`buildCombo` counts the upgrade a combo needs in its cost.** Today Sayur Segar looks one build away while its Warung needs Rp 10.4M of upgrades, so takeover seed 3 never progresses (T13). Adding the upgrade cost sorts it behind cheaper combos, which is how a player reads the book.
3. **Strategy bots move off-road pieces.** A player can demolish and rebuild beside the road. The bot cannot, so takeover seed 5 stalls (T13). The fix also measures the game risk T13 named: an off-road map plus debt may leave no affordable recovery. If seed 5 still stalls after the fix, that is a game finding for the next plan, not a bot fault.
4. **The random bot lays paths at the start.** The tutorial teaches Jalan Setapak first, so even a careless player has paths. The random bot never calls `laySetapak`, which leaves every random map off-road. Counter: this changes item 21's random count and the takeover inputs. Accepted; T4 runs last so T3's check uses today's random states.

No decision changes the game, so none goes to Hari.

## Tasks

Every task: put any local measuring in `tests/scorecard/measure-<task>.test.ts` (for example `measure-T1.test.ts`). That path is in each task's Files, so the gate accepts it; the reviewer deletes it in the review commit. Use exactly that one file name for all scratch work. vitest hides console output: write measurements to a file under `/tmp` in `afterAll` and read that file.

Run one at a time on the executor, in order T1, T2, T3, T4. All four touch `tests/scorecard/driver.ts`, so each starts from main after the earlier one merges. After T4 merges, run Nightly and re-judge items 1, 7, 10, 17, 21 and 23.

Builder baseline on main (68be6cc), star minutes RT 1★, 2★, 3★, RW 1★, 2★, 3★:
- Seed 1: 0.3, 9.3, 10.8, 12.0, 26.9, 27.7
- Seed 2: 0.3, 8.8, 11.1, 12.1, 26.9, 27.6
- Seed 3: 0.3, 8.5, 9.9, 11.1, 25.3, 28.8

### T1. Builder buys its generic list only after the combo line is met (Sonnet, executor trial)
- Files: `tests/scorecard/measure-T1.test.ts`, `tests/scorecard/driver.ts`, `decisions/scorecard-bot-fixes-T1.md`, `progress/scorecard-bot-fixes-T1.md`
- Exact changes:
  1. Add an optional `comboFirst?: boolean` to the `Plan` type. Set `comboFirst: true` on the `builder` plan only.
  2. In `playPlan`, just before `buildFrom`: when `p.comboFirst` is set and `nextStarChecklist(s)` has a line that is not done with `goal.kind` `'combos'` or `'rwCombos'`, call `buildFrom` with only the ids of `p.order(s)` that are in `['posRonda', 'warung', 'wifi']`. Otherwise call it as today.
  3. Do not change `builderOrder`, `buildCombo`, other plans or `BASE`.
- Done when: `npm run typecheck` and `npx vitest run tests/scorecard/harness.test.ts` pass. A local `runBot('builder', seed, 700)` on seeds 1 to 10 reaches RW 3★ on every seed. On seeds 1 to 3, RT 2★ is at or under 6 min and RW 2★ is no later than the baseline above plus 1 min. Write the before and after star minutes for seeds 1 to 3 in the progress file. If a done-check fails, write the numbers in the decisions file and stop; do not tune further.
- Don't touch: `src/`, `tests/scorecard/scorecard.ts`, TODO.md, `tests/e2e/`. No refactors. No e2e needed.

### T2. `buildCombo` counts the upgrade a combo needs (Sonnet, executor trial)
- Files: `tests/scorecard/measure-T2.test.ts`, `tests/scorecard/driver.ts`, `decisions/scorecard-bot-fixes-T2.md`, `progress/scorecard-bot-fixes-T2.md`
- Exact changes:
  1. In `buildCombo`, where `cost` is computed for each scored combo, add the upgrade cost of every need with `level > 1`. For a need `{ id, level }`: if no building of `id` stands, keep today's cost. If the highest-level standing copy has `level < need.level`, add `upgradeCost(s, copy) * (need.level - copy.level)`. Import `upgradeCost` from `src/sim/state`.
  2. Keep the sort by `cost` and keep the existing upgrade branch as it is.
- Done when: typecheck and `npx vitest run tests/scorecard/harness.test.ts` pass. `takeover(3, 'random', 100)` from `tests/scorecard/takeover.ts` returns `gained: true`. Builder seeds 1 to 3 at 700 ticks are no more than 1 min later than after T1 on any star. Write takeover seeds 1 to 5 (random, 100) and the builder minutes in the progress file.
- Don't touch: `src/`, `scorecard.ts`, other plans, TODO.md, `tests/e2e/`. No refactors. No e2e needed.

### T3. Strategy bots rebuild off-road pieces beside the road (Sonnet, executor trial)
- Files: `tests/scorecard/measure-T3.test.ts`, `tests/scorecard/driver.ts`, `decisions/scorecard-bot-fixes-T3.md`, `progress/scorecard-bot-fixes-T3.md`
- Exact changes:
  1. Add `moveOffRoad(c, buffer)` to `driver.ts`. In the RT stage only, take the first building with `b.noRoad` whose def is not decoration, not in `FLAT` and whose id does not start with `kantor`. Skip it if `spotFor(s, b.def)` finds no spot, or if `s.res.rupiah < buffer + buildCost(s, def(b.def))`. Otherwise `demolish(s, b)`; if that is ok, `buy(c, b.def, buffer)`. At most one move per call.
  2. Call `moveOffRoad(c, p.buffer)` in `playPlan` right after `keepDrains`.
- Done when: typecheck and `npx vitest run tests/scorecard/harness.test.ts` pass. Report `takeover(5, 'random', 100)`. If it still has `gained: false`, write the state at the end of the window (cash, residents, off-road count, debt) in the decisions file as a game finding; that is a valid result. Builder seeds 1 to 3 at 700 ticks are no more than 1 min later than after T2 on any star. Write takeover seeds 1 to 5 (random, 100) and the builder minutes in the progress file.
- Don't touch: `src/`, `scorecard.ts`, `spotFor`, TODO.md, `tests/e2e/`. No refactors. No e2e needed.

### T4. The random bot lays paths at the start (Sonnet, executor trial)
- Files: `tests/scorecard/measure-T4.test.ts`, `tests/scorecard/driver.ts`, `decisions/scorecard-bot-fixes-T4.md`, `progress/scorecard-bot-fixes-T4.md`
- Exact changes:
  1. In `playRandom`, at the top: `if (c.s.stage.current === 'rt' && c.t === 0) laySetapak(c);`. Nothing else in `playRandom` changes.
- Done when: typecheck and `npx vitest run tests/scorecard/harness.test.ts` pass. Write, before and after: how many of `runBot('random', seed, 450)` seeds 1 to 10 reach RT 1★ and the minute of each, and takeover seeds 1 to 5 (random, 100) `gained`. Put the numbers in the progress file.
- Don't touch: `src/`, `scorecard.ts`, other plans, TODO.md, `tests/e2e/`. No refactors. No e2e needed.

## Open questions
- None yet. Results go here as tasks merge.
