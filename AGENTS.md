# AGENTS.md

Single source of rules for AI coding agents. Tool-specific files (CLAUDE.md, .cursor/rules, .github/copilot-instructions.md, GEMINI.md, .windsurfrules) only point here.

## Read first

Read before you plan or write code. Read only what your change touches, but never skip a doc that applies.

- [CONTRIBUTING.md](CONTRIBUTING.md): UI, i18n, art, tone, naming, workflow. Always read.
- [UI.md](UI.md): 12 UI rules. Read for any screen, text or layout change.
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

- After opening a PR, enable auto-merge (squash). It merges when the required `ci` check is green.
- After every push, check the PR for merge conflicts. A conflicted PR never starts CI. Merge main in and push again.
- Before a push, run `npm run typecheck`, `npm test`, and only the e2e specs your change touches, for example `npx playwright test tests/e2e/ui.spec.ts`. Do not run the full `npm run e2e` (about 880 tests) locally. Text-only changes to docs or comments need no e2e run.
- CI runs the full sharded e2e suite in id (the default language) at 320, 360, 412 and 430px on every PR. Let CI run it.
- Batch small tweaks (text, sounds, small TODO items) into one PR. Each PR costs a full CI run. When claiming TODO items, claim several small related ones together.
- English is not in CI. A change to English UI text or layout runs the touched specs in English before you push, for example `npx playwright test tests/e2e/ui.spec.ts --project=phone-412-en`.
- [TODO.md](TODO.md) lists open tasks and ideas. Check it first. Code PRs never edit TODO.md, because it causes merge conflicts and CI reruns. Claim an item (set owner and date), move it to Done after the PR merges, and add open work you find in a separate docs-only change. Push it straight to main if you are allowed to, otherwise open a docs-only PR. Docs-only PRs skip e2e, so they are cheap.
- Log design decisions in `decisions/<pr-or-slug>.md` and shipped work in `progress/<pr-or-slug>.md`.
- Never edit `DECISIONS.md` or `PROGRESS.md` (frozen), or another PR's log file.
- To test a later stage, use Settings, Developer: it loads a seeded RT 3★, RW or Kelurahan game. See `decisions/dev-seeds.md`.
