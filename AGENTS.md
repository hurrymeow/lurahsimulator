# AGENTS.md

Single source of rules for AI coding agents. Tool-specific files (CLAUDE.md, .cursor/rules, .github/copilot-instructions.md, GEMINI.md, .windsurfrules) only point here.

## Read first

Read before you plan or write code. Read only what your change touches, but never skip a doc that applies.

- [CONTRIBUTING.md](CONTRIBUTING.md): UI, i18n, art, tone, naming, workflow. Always read.
- [UI.md](UI.md): 18 UI rules. Read for any screen, text or layout change.
- [ART.md](ART.md): sprite and icon rules. Read for any art.
- [GAME-DESIGN.md](GAME-DESIGN.md): the game design. Pitch, stage ladder, pacing targets, economy, tone and politics, UI rules. Read for new mechanics, map or stage work, economy, events, tutorial or progression. Read only the section you touch.
- [TESTING.md](TESTING.md): the review checklist for the test suite. Read before you add or change tests, CI or bots.
- `decisions/`: past decisions. Search it before you change anything it may cover.

## Conformance protocol

Run this before coding and again before you commit.

1. List the docs that apply to your planned change.
2. Compare the plan, then the diff, against each rule in them.
3. If anything conflicts, **stop**. Do not code around it. Do not diverge silently.
4. Tell the human which doc, which rule, and what your change does instead.
5. Ask them to choose one:
   - **1) Change the code** to match the doc.
   - **2) Update the doc** to match the change.
6. Wait for the answer. Do not pick for them.
7. On choice 2, edit the doc in the same PR. Add `decisions/<pr-or-slug>.md` saying what changed and why.
8. In the PR body, state "Follows the docs" or "Updates the docs: <which, why>".

Unsure whether it conflicts? Treat it as a conflict and ask.

## Workflow rules

- Open the PR yourself once the local checks pass, without asking Hari, and enable auto-merge (squash) at once (Hari, 2026-11-07). After opening a PR, enable auto-merge (squash). It merges when the required `ci` check is green. Exception: executor PRs (opened by the DeepSeek executor workflow). Never enable auto-merge on them. The reviewer enables it after reading the full diff. See `decisions/deepseek-executor.md`.
- Plans: a task marked Haiku lists exact file paths in `Files:`, not "grep X". It also has `Exact changes:`, `Done when:` and `Don't touch:` lines. The executor refuses a task without them.
- Plans: when you write a plan, split out every mechanical task (copy, i18n strings, config values, renames, small style changes where the exact files and strings are known) and tag it `(Haiku)` with exact old and new strings. Those tasks go to the DeepSeek executor by default: dispatch `deepseek-exec.yml` with the plan slug and task id, one task per run, instead of opening a Claude thread. Tasks that need reading code to decide how stay Sonnet. Review the executor PR's full diff before merging.
- After every push, check the PR for merge conflicts. A conflicted PR never starts CI. Merge main in and push again.
- A CI run on your own PR that GitHub holds for approval ("action required", for example the pull_request run after the Update baselines bot pushes) blocks auto-merge. Approve it yourself (`gh api -X POST repos/<owner>/<repo>/actions/runs/<id>/approve`) and let auto-merge finish; do not ask Hari first (Hari, 2026-11-07).
- Before a push, run `npm run typecheck`, `npm test`, and only the e2e specs your change touches, for example `npx playwright test tests/e2e/ui.spec.ts`. Do not run the full `npm run e2e` (about 880 tests) locally. Text-only changes to docs or comments need no e2e run.
- CI runs the full sharded e2e suite in id (the default language) at 320, 360, 412 and 430px on every PR. Let CI run it.
- Batch small tweaks (text, sounds, small TODO items) into one PR. Each PR costs a full CI run. When claiming TODO items, claim several small related ones together.
- English runs in CI only when a PR changes `src/i18n/`: the whole suite at 412px (job `e2e-en`). A change to English UI text or layout still runs the touched specs in English before you push, for example `npx playwright test tests/e2e/ui.spec.ts --project=phone-412-en`.
- Every e2e shard lists its failed and flaky tests in the run summary (`scripts/flaky-summary.mjs`). A test that passed on retry is a bug to fix, not a pass.
- Every e2e test runs under a console guard (`tests/e2e/fixtures.ts`): a page error or a `console.error` fails it. Import `test` and `expect` from `./fixtures`, never from `@playwright/test`. `tests/e2e/canary.spec.ts` proves each check can fail. WebKit runs nightly (`e2e-webkit.yml`), and so do the property tests at 1000 games per rule.
- [TODO.md](TODO.md) lists open tasks and ideas. Check it first. Code PRs never edit TODO.md, because it causes merge conflicts and CI reruns. Claim an item (set owner and date), move it to Done after the PR merges, and add open work you find in a separate docs-only change. Push it straight to main if you are allowed to, otherwise open a docs-only PR. Docs-only PRs skip e2e, so they are cheap.
- TODO items need no approval from Hari. Claim, build, judge against GAME-DESIGN.md §8, the UI.md review checklist and TESTING.md, and approve yourself, logging the verdict in `decisions/`. Ask Hari only for credentials, GitHub or repo settings, spending money, or irreversible actions. A doc conflict under the Conformance protocol still goes to Hari.
- Log design decisions in `decisions/<pr-or-slug>.md` and shipped work in `progress/<pr-or-slug>.md`.
- Never edit `DECISIONS.md` or `PROGRESS.md` (frozen), or another PR's log file.
- To judge mechanics, pacing or balance, run `npm run scorecard` (about 15 min) and read `scorecard/scorecard.md`. It scores GAME-DESIGN.md section 8 with nine bots. CI runs it nightly. Do not run it for UI or text changes.
- To test a later stage, use Settings, Developer: it loads a seeded RT 3★, RW or Kelurahan game. See `decisions/dev-seeds.md`.
