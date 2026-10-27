# AGENTS.md

Single source of rules for AI coding agents. Tool-specific files (CLAUDE.md, .cursor/rules, .github/copilot-instructions.md, GEMINI.md, .windsurfrules) only point here.

## Read first

Read before you plan or write code. Read only what your change touches, but never skip a doc that applies.

- [CONTRIBUTING.md](CONTRIBUTING.md): UI, i18n, art, tone, naming, workflow. Always read.
- [UI-RUBRIC.md](UI-RUBRIC.md): 12 UI rules. Read for any screen, text or layout change.
- [PACING.md](PACING.md): pacing and balance targets. Read for economy, events, tutorial or progression.
- [ART.md](ART.md): sprite and icon rules. Read for any art.
- [STAGES.md](STAGES.md): RT, RW, Kelurahan stage rules. Read for map or stage work.
- [DESIGN.md](DESIGN.md): game design. Read for new mechanics.
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
- CI runs en and id at 320, 360 and 390px. Do not cut that down.
- Log design decisions in `decisions/<pr-or-slug>.md` and shipped work in `progress/<pr-or-slug>.md`.
- Never edit `DECISIONS.md` or `PROGRESS.md` (frozen), or another PR's log file.
