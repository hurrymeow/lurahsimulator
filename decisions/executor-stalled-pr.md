# Executor failures and stalled PRs

## What happened (2026-11-06)
`icon-first-ui` T1 ran 41 turns against a cap of 40, so the model never wrote `report.json`. The gate called it "report.json missing or invalid" and opened a draft PR marked failed. Its patch was complete and correct. Nobody was watching the PR, so it sat for 8 hours. T2 hit 41 turns too but had written its report first.

CI on an executor PR is started with a `workflow_dispatch` run. GitHub does not count it as the PR's required `ci` check, so the PR stays "blocked" until a run for a `pull_request` event exists. A push by a person or by a Claude session starts that run. A push by the workflow's token does not (it stops at "awaiting approval").

## Fixes
- Turn cap 40 to 60. The one-file tasks need about 40; Sonnet-tier tasks that read tests need more.
- The gate says "ran out of turns" and names the count, so a capped run reads as "patch may be complete", not "broken".
- **Dispatcher rule:** the session that dispatches an executor run subscribes to its PR (`subscribe_pr_activity`) as soon as the PR appears, reviews the diff, pushes one real commit (a review note in `progress/<plan>-<task>.md`, never an empty commit) so the `pull_request` CI run starts without anyone's approval, then enables auto-merge. Draft-failed PRs get the same review: a capped run is often complete.
- No PAT. A PAT would remove the gate but was declined (decisions/deepseek-executor.md).
