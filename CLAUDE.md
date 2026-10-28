# Working rules

- **Read [AGENTS.md](AGENTS.md) first and follow its Conformance protocol.** If a change conflicts with any doc, stop and ask the human: 1) change the code to match, or 2) update the doc in the same PR with a decisions/ note. Never diverge silently.

- Follow [CONTRIBUTING.md](CONTRIBUTING.md) for UI, i18n, art, tone, naming and workflow. It points to GAME-DESIGN.md, UI.md and ART.md.

- After opening a PR, run `gh pr merge --auto --squash <n>` (or the `enable_pr_auto_merge` tool). It merges the moment the required `ci` check is green.
- After every push, check the PR for merge conflicts. A conflicted PR never starts CI and sends no alert. If it conflicts, merge main in and push again.
- Before a push, run `npm run typecheck`, `npm test`, and only the e2e specs your change touches (for example `npx playwright test tests/e2e/ui.spec.ts`). Do not run the full `npm run e2e` (about 880 tests) locally; CI runs the full sharded suite in Indonesian (id) at 320, 360, 412 and 430px on every PR. Docs and comments need no e2e run.
- English is not in CI. For a change to English UI text or layout, run the touched specs with `--project=phone-<width>-en` (for example `--project=phone-412-en`) before you push.
- Pick work from [TODO.md](TODO.md). Never edit TODO.md in a PR. Claim an item, move it to Done and add new items with a docs-only push straight to main.
- Batch small tweaks (text, sounds, small TODO items) into one PR. Each PR costs a full CI run. When claiming TODO items, claim several small related ones together.
- Log design decisions in a new file `decisions/<pr-or-slug>.md`, and shipped work in `progress/<pr-or-slug>.md`. Never edit `DECISIONS.md` or `PROGRESS.md` (frozen) or another PR's file. This stops merge conflicts between parallel PRs.
