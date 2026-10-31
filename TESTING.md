# Testing

The review checklist for the test suite. Approved by Hari, 2026-10-31. See `decisions/testing-checklist.md`.

[GAME-DESIGN.md](GAME-DESIGN.md) section 8 and the [UI.md](UI.md) Review checklist say what to measure. This file says whether the test suite can be trusted to measure it. Workflow rules for running tests stay in [AGENTS.md](AGENTS.md).

Decided 2026-10-31, code pending: English e2e at 412px in PR CI when `src/i18n/` changes (item 9), a WebKit smoke project on every PR with the full suite nightly (item 13), and a nightly CI workflow (items 6, 11, 12, 13, 17). Until they ship, AGENTS.md describes CI as it runs today.

## What this checklist is for

- GAME-DESIGN.md section 8 and the UI.md Review checklist say **what** to measure. This checklist says whether the **test suite** can be trusted to measure it.
- If agents replace Hari's playtesting, the tests are their eyes. A flaky or blind suite lets agents ship bugs with a green tick.
- Tags: **[PR]** checked on every code PR. **[Nightly]** a scheduled workflow, so PRs stay cheap. **[Audit]** a periodic review of the suite itself. **[Deploy]** after merge to main.
- Every new CI job states the minutes it adds. Heavy checks go nightly (CLAUDE.md: each PR costs a full CI run).

## Today's suite

- **Unit and sim:** 52 test files in `tests/` (plus 3 helpers), about 380 tests, run by `npm test`. `balance.test.ts` runs the idle and builder bots on 10 seeds.
- **E2E:** `tests/e2e/ui.spec.ts` (about 100 tests) and `visual.spec.ts` (5 baselines: home, HUD, Build, event, tip; 412px, Indonesian only). Chromium only.
- **CI:** typecheck, unit, build, then e2e in 6 shards in Indonesian at 4 widths (about 420 test runs). English runs weekly (`e2e-en.yml`). 1 retry. The Playwright report is uploaded only when a run fails or is cancelled. Service workers are blocked in tests.
- **Randomness:** the sim uses a seeded RNG (`src/sim/rng.ts`). `Math.random` appears only in `src/ui` and `src/render`. One wall-clock default remains in the sim: `newGame(seed = Date.now() % ...)` in `src/sim/state.ts`.
- **Build stamp:** the build already stamps a content hash (`__VERSION__` in `vite.config.ts`) for the update banner.

## Cross-references (not repeated here)

| Topic | Where the bar lives | What this checklist adds |
| --- | --- | --- |
| Offline and updates | UI.md item 22 | Item 11: a spec with service workers on |
| Start time and fps | UI.md items 18, 19 | Item 12: how to gate noisy numbers |
| Both languages | UI.md item 23, AGENTS.md | Item 9: when English runs in CI |
| Screenshot baselines | UI.md "Screenshot baselines" | Item 18: coverage and pinned tolerance |
| Bots and scorecard | GAME-DESIGN.md section 8 | Item 7: the harness that produces it |

## Sources quoted

| Tag | Source |
| --- | --- |
| **Fowler-ND** | Martin Fowler, [Eradicating Non-Determinism in Tests](https://martinfowler.com/articles/nonDeterminism.html) |
| **Fowler-TP** | Ham Vocke on martinfowler.com, [The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) |
| **PW-BP** | Playwright, [Best practices](https://playwright.dev/docs/best-practices) |
| **PW-Retry** | Playwright, [Retries](https://playwright.dev/docs/test-retries) |
| **Stryker** | [Stryker Mutator docs](https://stryker-mutator.io/docs/) |
| **fast-check** | [What is property-based testing](https://fast-check.dev/docs/introduction/what-is-property-based-testing/) |
| **HIG-Feedback** | Apple HIG, [Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback) |
| **WebKit-iOS** | Niels Leenheer, [Chrome is the new Safari](https://nielsleenheer.com/articles/2021/chrome-is-the-new-safari-and-so-are-edge-and-firefox/); Apple App Store Review Guideline 2.5.6 |

All quotes were fetched from the pages on 2026-10-31.

---

## A. Can the suite be trusted?

### 1. Same seed, same game [PR]
- **Ask:** does the sim produce exactly the same timeline for the same seed and inputs?
- **What good looks like:**
  > "Non-deterministic tests have two problems, firstly they are useless, secondly they are a virulent infection" (Fowler-ND)
- **Good here:** every sim test passes a seed. Two runs of the same bot and seed give byte-identical timelines.
- **Bad here:** a balance test that passes 9 times in 10.
- **Sub-checks:**
  - T1 lint: no `Math.random`, `Date.now` or `performance.now` under `src/sim/`. The `newGame` default seed moves to the caller in `src/ui`.
  - The builder bot run twice on 3 seeds; diff the timelines.
- **Pass:** 0 lint hits. 0 diffs. Adds under 10s to `npm test`.

### 2. Flakes are counted, not hidden [PR]
- **Ask:** do we know which tests pass only on retry, and do they get fixed?
- **What good looks like:**
  > "flaky" - tests that failed on the first run, but passed when retried (PW-Retry)
  > "Once you start ignoring a regression test failure, then that test is useless" (Fowler-ND)
  > "Place any non-deterministic test in a quarantined area." "(But fix quarantined tests quickly.)" (Fowler-ND)
- **Good here:** CI keeps 1 retry, adds a `json` reporter, and always uploads it. A summary step lists flaky tests by name. A test that flakes on main moves to a nightly-only quarantine project, listed in `tests/QUARANTINE.md` with an owner and a fix date. Quarantined tests still run nightly.
- **Bad here:** a retry silently turns red into green, and the report is thrown away because the run ended green.
- **Sub-checks:** the summary step exists; a nightly job counts flaky tests on main over 7 days, each test once.
- **Pass:** 0 tests flaking on main over 7 days, or each is in quarantine. Nothing in quarantine over **7 days**. No test deleted or `skip`ped to get green.

### 3. Tests catch planted bugs [Audit]
- **Ask:** if we break the sim on purpose, do the tests notice?
- **What good looks like:**
  > "If your tests fail then the mutant is killed." (Stryker)
  > "If your tests passed, the mutant survived." (Stryker)
  > "code coverage doesn't tell you everything about the effectiveness of your tests." (Stryker)
- **Good here:** monthly Stryker run on `src/sim/rules.ts`, `src/sim/gate.ts` and `src/sim/save.ts` only, using the fast unit tests, not the 10-seed balance run.
- **Bad here:** high line coverage, but flipping a `>` in the star check breaks nothing.
- **Sub-checks:** run time recorded; every survivor triaged as "needs a test" or "equivalent mutant".
- **Pass:** every survivor triaged within the month. 0 "needs a test" survivors left in star gates.

### 4. Every bug gets a test that would have caught it [PR]
- **Ask:** when a bug is fixed, is there a test that fails without the fix?
- **What good looks like:**
  > "If a higher-level test spots an error and there's no lower-level test failing, you need to write a lower-level test" (Fowler-TP)
- **Good here:** a fix PR (title starts with "Fix" or its `progress/` note says fix) adds a test at the lowest level that shows the bug. The PR body shows it failing on main.
- **Bad here:** a test file touched for show, which passes before and after.
- **Sub-checks:** reviewer checks out main, applies only the new test, and sees it fail.
- **Pass:** 100% of fix PRs.

### 5. The scans can fail [Audit]
- **Ask:** would the legibility scan and the visual diff actually catch a broken screen?
- **What good looks like:** the Stryker idea, applied to the UI checks: plant a known fault and confirm a test fails.
- **Good here:** canary tests that inject a clipped label, a 12px text, a 30px button and a 4px layout shift, and assert the scan or diff fails.
- **Bad here:** a scan that silently passes because its selector matches nothing.
- **Sub-checks:** one canary per scan rule (rules 1, 4, 5) and one for the visual diff. Every scan asserts at least one element was checked.
- **Pass:** every canary fails as expected. 0 scans that check 0 elements.

## B. Does the suite cover the game?

### 6. Sim rules hold for any input [PR + Nightly]
- **Ask:** do the game's hard rules hold across many random games, not just the ones we wrote?
- **What good looks like:**
  > "A 'property' is an assertion of a relationship between a code's input and output which should hold for all sets of inputs." (fast-check)
  > On a failure, "fast-check will attempt to make sure this counterexample is as small as possible." (fast-check)
- **Good here:** property tests generate random build orders and event choices for 2 in-game years.
- **Sub-checks**, the invariants:
  - Stars never drop (GAME-DESIGN.md section 2).
  - No count below 0 (residents, staff, stock, Stempel).
  - No soft-lock: from any generated state, the builder bot taking over reaches the next star within 2x its target.
  - A save round-trips to an identical state.
- **Pass:** **200** games per invariant in `npm test` (adds under 30s), **1,000** nightly. 0 failures.

### 7. The scorecard harness exists [Audit]
- **Ask:** can the section 8 and UI.md scorecards actually be produced by one command?
- **What good looks like:** section 8 needs a timeline log and 9 bots. UI.md needs T2 sub-checks. Without them, most items stay Unknown.
- **Good here:** `npm run scorecard` runs the bots and specs and writes both scorecards, with each row's evidence linked. A golden-trend file keeps the key numbers per run (star times, novelty gaps, fps), so drift shows.
- **Bad here:** only 2 of 9 bots exist, so "no dominant strategy" can never be checked.
- **Sub-checks:** each bot runs headless; each item names its query; the trend file diffs against the last run.
- **Pass:** no blank rows. Every Pass or Fail links evidence; every Unknown says what is missing. Runs nightly in under 20 minutes.

### 8. Every sim action is reachable by thumb [Audit]
- **Ask:** can a player at 320px actually do everything the bots do?
- **Why:** bots call the sim directly. A bot can pass a star using an action the UI hides, cuts off or never offers.
- **Good here:** a list of every sim action the bots use, each with a T2 path from the map at 320px.
- **Bad here:** the bot hires staff through a function the UI has no button for.
- **Sub-checks:** action list from the bot code; a T2 path per action; each path within the UI.md item 5 tap counts.
- **Pass:** 100% of bot actions reachable at 320px in both languages.

### 9. English is tested when English changes [PR]
- **Ask:** does a change to UI text get tested in English before merge?
- **What good looks like:** AGENTS.md already asks agents to run touched specs in English locally. CI does not check that they did.
- **Good here:** when `src/i18n/` changes, CI adds one English project at 412px for the full e2e suite (about 105 runs, about one extra shard).
- **Bad here:** an English clipping bug found by the weekly run, a week later.
- **Conflict:** this changes `decisions/default-lang-id.md` and AGENTS.md ("English is not in CI"). It needs Hari's call and a decisions note.
- **Pass:** 100% of PRs touching `src/i18n/` run English e2e at 412px.

### 10. Incompatible saves are handled openly [PR]
- **Ask:** when a save cannot load, does the player know, and can they start again in one tap?
- **What good looks like:**
  > "Show people when a command can't be carried out and help them understand why." (HIG-Feedback)
- **Policy (Hari, 2026-10-31):** old saves need no migration. If a save is incompatible, tell the player and offer a new game.
- **Bad here, today:** `deserialize` returns null for an unknown version or building id, and the caller starts fresh.
- **Sub-checks:** fixtures for an old version, an unknown building id, corrupt JSON, and `localStorage` unavailable (iOS private mode) or full. Each shows a message and New Game, or plays without saving. A current save round-trips unchanged.
- **Pass:** 0 silent drops. 0 crashes when storage throws. Being handled in the calendar thread.

## C. Does the suite test the real thing?

### 11. The PWA parts are tested [Nightly]
- **Ask:** are offline play and the forced update tested at all?
- **What good looks like:** the bars are in UI.md item 22.
- **Bad here, today:** every e2e run blocks service workers, so none of it is tested.
- **Sub-checks:** one spec with service workers on: offline reload; an update during play shows the Menu dot, not a reload; an update on home shows the full-screen button; a save happens before the reload.
- **Pass:** all four green nightly. Adds about 2 minutes, nightly only.

### 12. Noisy numbers are gated against a baseline [Nightly]
- **Ask:** do start time and frame rate fail a run when they get worse?
- **What good looks like:** the targets are in UI.md items 18 and 19. Shared CI runners render in software and vary run to run, so a fixed absolute number would flake (item 2).
- **Good here:** measure 20 runs first. Store the median. Fail when a run is more than 20% worse than the stored median, on 3 tries.
- **Bad here, today:** fps is checked only as a ratio between RT and Kelurahan, and start time not at all.
- **Pass:** gates in place and green. The absolute UI.md targets are checked on a real phone each month (item 16).

### 13. Phone browsers beyond Chromium [PR + Nightly]
- **Ask:** does the game run on WebKit, the engine every iPhone browser must use?
- **What good looks like:**
  > "Test across all browsers" (PW-BP)
  > On iOS, every browser uses WebKit (App Store Review Guideline 2.5.6; WebKit-iOS).
- **Limits:** Playwright's WebKit on Linux is a proxy, not iOS Safari. It misses iOS audio rules and installed-PWA behaviour. CPU throttling is Chromium-only, so fps is not measured there.
- **Good here:** a WebKit project at 412px runs 5 smoke specs on every PR (first build, event, save and reload, Build scan, Menu scan) and the full suite nightly. A real iPhone pass monthly (item 16).
- **Bad here, today:** Chromium only.
- **Conflict:** changes the AGENTS.md CI line. Needs a decisions note.
- **Pass:** WebKit smoke green on every PR, adding under 2 minutes. Nightly WebKit run with 0 new failures.

### 14. Deployed means live [Deploy]
- **Ask:** after merge, is the live site running the new build?
- **Good here:** the deploy job fetches the live page and compares its `__VERSION__` hash with the one just built.
- **Bad here:** a merged fix that never reached players.
- **Sub-checks:** the compare step; one smoke test against the live URL.
- **Pass:** every main deploy verified live within 10 minutes, or the run fails.

### 15. No errors in the console [PR]
- **Ask:** does any e2e run log an uncaught error or a console error?
- **Why:** an error that does not break a test is still a bug a player can hit.
- **Good here:** a shared fixture fails any test that logs `pageerror` or `console.error`. An allowlist names each known message with a reason.
- **Bad here:** a canvas exception on every pan, unseen because the test passed. Or errors hidden by removing `console.error` calls.
- **Sub-checks:** fixture on all specs; T1 lint that `console.error` in `src/` is not wrapped or silenced.
- **Pass:** 0 errors outside the allowlist. Allowlist reviewed monthly. Unknown today.

## D. Agents and humans

### 16. Agent runs give evidence; Hari calibrates [Audit]
- **Ask:** when an agent "plays", does it hand back data, and does someone check the data against real play?
- **Why:** Hari distrusts free-text AI playtests. The scorecard is only useful if it matches what a person feels.
- **Good here:** the agent runs the scorecard (item 7), attaches the timeline and screenshots, and writes opinions in a separate, labelled section. Once a month Hari plays the 15-minute script on a real phone (an iPhone if possible) and marks any scorecard row they disagree with.
- **Bad here:** "the game felt a bit slow around minute 10", with nothing attached.
- **Pass:** every Pass or Fail in an agent report links an artifact. Rows Hari disputes become fixes to the checklist or the harness.

### 17. Random play and long play [Nightly]
- **Ask:** does random input, a long session or a backgrounded tab break the game?
- **What good looks like:** the fast-check idea applied end to end: random inputs find what scripted tests never try.
- **Good here:**
  - A headless sim monkey: random legal actions for a whole run, checking the item 6 invariants.
  - A 60s UI monkey per width: random taps; fail on a console error or a sheet with no way out. Autopaused pop-ups are not "stuck".
  - A soak run: 1 hour at 2x on the largest seed; memory and frame time at the start and end.
  - A background check: hide the tab for 60s; the clock pauses or catches up as designed, with no burst of pop-ups.
- **Pass:** 0 failures. Memory growth under 20% over the soak. Fits a 10-minute job per shard.

## E. Cost and speed

### 18. Baselines cover the right screens [Audit]
- **Ask:** do the visual baselines cover the screens that matter, with a fixed tolerance?
- **What good looks like:** UI.md: "Never refresh baselines to make CI pass. An unexpected diff is a bug to fix."
- **Good here:** add the main screen at RW and Kelurahan, the SK card and the home screen to today's 5. Keep `maxDiffPixelRatio: 0.002` and change it only with a decisions note.
- **Bad here, today:** 5 baselines at one width in one language.
- **Pass:** listed screens covered. Tolerance unchanged. Every refresh has a before and after.

### 19. The fast loop and CI stay fast [Audit]
- **Ask:** can an agent check a change locally in minutes, and is PR CI time stable?
- **What good looks like:** AGENTS.md: run typecheck, unit tests and only the touched specs; CI runs the rest.
- **Good here:** typecheck plus `npm test` timed on main; a helper that maps changed files to specs; median PR CI time printed weekly.
- **Bad here:** agents stalled 35+ minutes running the full e2e locally (seen 2026-10-28). Each new spec adds time unnoticed.
- **Sub-checks:** time the local loop; median and p90 of the `ci` check over the last 20 PRs.
- **Pass:** local loop within 20% of its measured baseline. PR CI median and p90 within 20% of theirs. A PR that adds over 30s of CI time says why.

---

## Known gaps today

- Fail: item 10 (incompatible saves dropped silently; fix in the calendar thread), item 11 (service workers blocked), item 13 (no WebKit), item 2 (no flaky report kept on green runs).
- Unknown: items 3, 5, 6, 7 (7 of 9 bots missing), 8, 12, 15, 17.
