# DeepSeek executor

Plan: `docs/plans/deepseek-executor.md`. Approved by Hari, 2026-11-01.

## What
Haiku-tier plan tasks can run on DeepSeek Flash in a GitHub Action. A person or the main session starts it with `workflow_dispatch` (inputs `plan`, `task`). Trial: this repo only, 5 tasks.

## How to run
- GitHub Mobile or web: Actions, `deepseek-exec`, Run workflow. Enter the plan slug and task id, for example `ui-audit-fixes` and `T9`.
- The main session can use the GitHub MCP `actions_run_trigger` tool.
- The only secret is `DEEPSEEK_API_KEY`. Settings, Actions, General must allow Actions to create pull requests.
- The workflow refuses a task that is not marked Haiku or lacks `Files:`, `Exact changes:`, `Done when:` and `Don't touch:`.

## Decisions
- **Executor PRs never enable auto-merge.** AGENTS.md has an exception line. Why: the model is untrusted and the reviewer reads the full diff first. The reviewer enables auto-merge after approval. The run prompt also overrides the CLAUDE.md rule.
- **Haiku tasks list exact paths.** Why: the diff gate allows only the paths in `Files:`.
- The PR token is the default GITHUB_TOKEN, then the workflow dispatches `ci.yml` (same trick as #134). Why: no long-lived write secret.
- Gate limits: 12 files, 400 changed lines. A gate failure opens no PR.
- A design question mid-task ends the run with `stopped` and a question. The answer goes into the plan, then the task is re-dispatched.

## Stop rule
Pause the trial after any gate escape or a second rework. Metrics are in the plan's Q6.
