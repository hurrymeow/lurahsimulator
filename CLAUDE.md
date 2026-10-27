# Working rules

- **Read [AGENTS.md](AGENTS.md) first and follow its Conformance protocol.** If a change conflicts with any doc, stop and ask the human: 1) change the code to match, or 2) update the doc in the same PR with a decisions/ note. Never diverge silently.

- Follow [CONTRIBUTING.md](CONTRIBUTING.md) for UI, i18n, art, tone, naming and workflow. It points to DESIGN.md, ART.md and STAGES.md.

- After opening a PR, run `gh pr merge --auto --squash <n>` (or the `enable_pr_auto_merge` tool). It merges the moment the required `ci` check is green.
- After every push, check the PR for merge conflicts. A conflicted PR never starts CI and sends no alert. If it conflicts, merge main in and push again.
- CI runs both languages (en, id) at 320, 360 and 390px. Do not cut that down to save time.
- Log design decisions in a new file `decisions/<pr-or-slug>.md`, and shipped work in `progress/<pr-or-slug>.md`. Never edit `DECISIONS.md` or `PROGRESS.md` (frozen) or another PR's file. This stops merge conflicts between parallel PRs.
