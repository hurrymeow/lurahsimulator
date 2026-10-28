# Working rules

- **Read [AGENTS.md](AGENTS.md) first and follow its Conformance protocol.** If a change conflicts with any doc, stop and ask the human: 1) change the code to match, or 2) update the doc in the same PR with a decisions/ note. Never diverge silently.

- Follow [CONTRIBUTING.md](CONTRIBUTING.md) for UI, i18n, art, tone, naming and workflow. It points to GAME-DESIGN.md, UI.md and ART.md.

- After opening a PR, run `gh pr merge --auto --squash <n>` (or the `enable_pr_auto_merge` tool). It merges the moment the required `ci` check is green.
- After every push, check the PR for merge conflicts. A conflicted PR never starts CI and sends no alert. If it conflicts, merge main in and push again.
- CI runs Indonesian (id, the default language) at 320, 360, 412 and 430px. Local `npm run e2e` adds English (en) at the same widths: run it before you push a change to English text or layout. Do not cut either down to save time.
- Pick work from [TODO.md](TODO.md). When you start an item, remove it from the list in your PR. Add open work you find or leave behind.
- Log design decisions in a new file `decisions/<pr-or-slug>.md`, and shipped work in `progress/<pr-or-slug>.md`. Never edit `DECISIONS.md` or `PROGRESS.md` (frozen) or another PR's file. This stops merge conflicts between parallel PRs.
