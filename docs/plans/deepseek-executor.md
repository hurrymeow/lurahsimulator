# DeepSeek executor

## Goal
Run Haiku-tier plan tasks on DeepSeek Flash inside a GitHub Action, so Claude usage goes to planning and review. Trial on hurrymeow/lurahsimulator only, 5 tasks.

## Verified facts
- Endpoint: `ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic`, key in `ANTHROPIC_AUTH_TOKEN`. [DeepSeek Claude Code guide](https://api-docs.deepseek.com/quick_start/agent_integrations/claude_code/)
- Model ID: **`deepseek-flash`** is current. `deepseek-v4-flash` is a legacy name. It is still accepted, but its model is retired; it is served by DeepSeek-V4.1-Flash-1017 at Flash price. [Pricing](https://api-docs.deepseek.com/quick_start/pricing)
- DeepSeek's documented Claude Code env: `ANTHROPIC_MODEL=deepseek-flash[1m]`, `ANTHROPIC_DEFAULT_{OPUS,SONNET}_MODEL=deepseek-flash[1m]`, `ANTHROPIC_DEFAULT_HAIKU_MODEL=deepseek-flash`, `CLAUDE_CODE_SUBAGENT_MODEL=deepseek-flash`, `CLAUDE_CODE_EFFORT_LEVEL=max`, `CLAUDE_CODE_AUTO_COMPACT_WINDOW=786432`. (same source)
- Name mapping: `claude-opus*` maps to deepseek-v4-pro. Other `claude*` names map to Flash. Unknown non-claude names return 400. So a stray Opus alias would silently bill Pro; set every model var explicitly. [Anthropic API guide](https://api-docs.deepseek.com/guides/anthropic_api)
- Ignored fields include `cache_control`. Images in assistant messages are rejected by Flash. (same source)
- Price per 1M tokens, peak / off-peak: input miss $0.30 / $0.15, cache hit $0.006 / $0.003, output $1.20 / $0.60. Peak is 01:00–04:00 and 06:00–10:00 UTC on weekdays (09:00–12:00 and 14:00–18:00 SGT). [Pricing](https://api-docs.deepseek.com/quick_start/pricing)
- Concurrency limit 2500 per account for Flash; over-limit returns 429. [Rate limit](https://api-docs.deepseek.com/quick_start/rate_limit/)
- Claude Code web search on DeepSeek hits DeepSeek's billed Search API. (Claude Code guide)
- GITHUB_TOKEN: "events triggered by the GITHUB_TOKEN will not create a new workflow run", except `workflow_dispatch` and `repository_dispatch`. [GitHub docs](https://docs.github.com/en/actions/concepts/security/github_token)
- This repo already relies on that exception. `update-baselines.yml` pushes with the default token, then dispatches `ci.yml` (#134).
- GitHub Mobile can run `workflow_dispatch` workflows from Actions → Workflows. [Changelog 2024-07-30](https://github.blog/changelog/2024-07-30-run-workflows-set-as-workflow_dispatch-manually/)
- Claude Code's `total_cost_usd` uses Claude prices. It is wrong for DeepSeek. Spend must come from token counts or the DeepSeek dashboard. (first principles: the CLI does not know the backend's price list)

## Q1. Trigger
Problem: who starts a run, from where, with what input.

Options
- A. `workflow_dispatch` with inputs `plan` (slug) and `task` (e.g. T9).
  - Pro: only write-access users can run it. Runs from GitHub Mobile. The main session can fire it with the GitHub MCP `actions_run_trigger` tool.
  - Con: free-text inputs; typos must be caught by the workflow.
- B. Label on an issue (one issue per task).
  - Pro: visible queue.
  - Con: an issue per task is overhead. Labels added by GITHUB_TOKEN never fire. More attack surface (anyone with triage).
- C. Issue comment command (`/deepseek T9`).
  - Con: needs comment parsing and author checks; most surface.

Recommendation: **A**. Validate inputs against the plan file on main before any model call.

## Q2. Guardrails
Problem: an untrusted model has a shell and the repo. Limit what it can do and what can reach a PR.

Options
- A. Prompt-only rules.
  - Con: a model can ignore a prompt.
- B. Tool allowlist plus prompt.
  - Pro: blocks most misuse at the CLI.
  - Con: still trusts the model to stay in its files.
- C. B plus a two-job split and a mechanical diff gate the model cannot touch.
  - Pro: the model never holds a write token; bad diffs never become PRs.
  - Con: more workflow code (~150 lines of script).

Recommendation: **C**.
- Job 1 `execute`: `permissions: contents: read`, `persist-credentials: false`. Runs in the Playwright container used by `e2e-en.yml`. Outputs a patch and `report.json` as artifacts.
- Job 2 `publish`: `contents: write`, `pull-requests: write`, `actions: write`. No model and no DeepSeek key. Applies the patch, runs the gate, pushes, opens the PR, dispatches `ci.yml`.
- Pre-flight refusal (before the model): the task heading in `docs/plans/<plan>.md` on main must match `### <task>. … (Haiku)`. It must have `Files:`, `Exact changes:`, `Done when:` and `Don't touch:` lines. Otherwise fail with a one-line reason.
- CLI: `claude -p --max-turns 40 --permission-mode acceptEdits --output-format json`, pinned CLI version, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1`.
- Allowed tools: Read, Edit, Write, Glob, Grep, `Bash(npm run typecheck)`, `Bash(npm test:*)`, `Bash(npx playwright test:*)`, `Bash(git diff:*)`, `Bash(git status)`.
- Disallowed: WebSearch, WebFetch, Task (subagents), NotebookEdit, any other Bash. No git commit or push by the model.
- Key safety (public repo, public logs): deny `Read(/proc/**)`, `Read(/etc/**)`, `Read(~/**)` and any path outside the workspace. The gate scans patch, `report.json` and PR body for the key in plain and base64 form; a match opens no PR, and the key is rotated. Keep a small DeepSeek balance.
- Timeouts: job 1 **25 min**, job 2 **10 min**. Concurrency group per plan+task, no cancel.
- Diff gate (job 2):
  - Changed paths must be in the task's `Files:` list, plus `decisions/<plan>-<task>.md` and `progress/<plan>-<task>.md`.
  - Hard deny regardless of plan: `TODO.md`, `DECISIONS.md`, `PROGRESS.md`, `.github/**`, `package*.json`, service worker, manifest, ART.md art assets, `**/*-snapshots/**`.
  - Caps: **≤ 12 files**, **≤ 400 changed lines**.
  - A gate failure opens no PR. It writes the reason to the job summary.
- Plan rule this needs: Haiku-tier tasks list exact paths, not "grep X". T9 in ui-audit-fixes.md would fail pre-flight today.

## Q3. Design questions mid-task
Problem: Flash hits a choice the plan didn't settle. It must stop, not guess.

Options
- A. Prompt says stop; the run just ends.
  - Con: silent; you learn nothing.
- B. Model writes `report.json` with `status: stopped`, the question and the options it sees. Job 2 surfaces it.
  - Pro: structured and reviewable; the gate still applies.
- C. Model comments on GitHub directly.
  - Con: needs a token in job 1. Breaks Q2.

Recommendation: **B**.
- `report.json` statuses: `done`, `stopped`, `failed` (checks still red after 2 fix attempts).
- `stopped` or `failed` with a diff: draft PR, label `executor:question` or `executor:failed`, question as the first comment.
- `stopped` with no diff: an issue titled `Executor question: <plan> <task>`.
- A missing or invalid `report.json` counts as `failed`.
- Answers go into the plan file, then the task is re-dispatched. No chatting with Flash.

## Q4. Opus review
Problem: you distrust other AIs' output (#130). Review must be strict but cheap.

Options
- A. Diff stats + run summary only (your usual rule for Claude threads).
  - Pro: cheapest.
  - Con: a summary written by the same model is what you distrust.
- B. Full diff read against the task's `Exact changes` and `Don't touch`, plus CI.
  - Pro: catches silent scope creep and wrong strings.
  - Con: more Opus tokens.

Recommendation: **B**. The 400-line cap keeps a full read to roughly 10–20k tokens. That is still far below a Haiku thread that reads files and runs tests.
- PR body written by job 2: plan + task link, model summary, file list with line counts, checks the model ran with exit codes, `report.json` status, token usage and computed spend.
- Opus checklist: every change maps to an `Exact changes` item; nothing in `Don't touch` moved; new strings exist in both EN and ID; decisions/ and progress/ files present; `ci` green.
- Opus enables auto-merge only after approval. The executor never does. Squash by hand if the MCP auto-merge ignores squash (seen 2026-10-28).
- Opus pushes small fixes itself and counts them as rework.

## Q5. Secrets
Problem: what you add in repo settings.

Options for the PR token
- A. Default GITHUB_TOKEN, then dispatch `ci.yml` (same trick as #134).
  - Pro: no long-lived secret. Precedent in this repo.
  - Con: PR author is github-actions[bot]. `pull_request` workflows don't fire on its push. CI tests the branch head, not the merge commit.
- B. Fine-grained PAT.
  - Pro: normal PR events.
  - Con: acts as you, so the PR looks like yours. A long-lived write secret.
- C. GitHub App token.
  - Pro: own identity, 1-hour tokens.
  - Con: most setup.

Recommendation: **A**. You add **one** secret: `DEEPSEEK_API_KEY`. You also tick Settings → Actions → General → "Allow GitHub Actions to create and approve pull requests". Move to C only if A's limits bite.
- Keep a small balance on the DeepSeek account as the hard spend cap. (Unverified that the account is prepaid; check the billing page.)
- Code and prompts go to DeepSeek's servers. Fine for this game repo; not for private work.

## Q6. Success after 5 tasks
Problem: decide keep, tune or stop with numbers.

Metrics and pass bar
- CI first-pass rate: **≥ 4 of 5** PRs green on first run.
- Rework: **≤ 1 of 5** PRs needs an Opus fix commit. None needs 2 rounds.
- Scope: **0** gate escapes. A gate catch counts separately and is fine.
- Stops: a correct `stopped` counts as a pass. A wrong guess counts as rework.
- Spend: tokens × DeepSeek price per run. Rough estimate is **$0.05–0.30** per task (most input is cache hits). Cross-check the DeepSeek dashboard once.
- Claude headroom: Opus review tokens per task versus a past Haiku thread on similar work. Note weekly usage % before and after.

Stop rule: pause after any gate escape or a second rework.

Counter-argument: Haiku threads are already your cheapest Claude cost. The saving is Haiku execution minus Opus review. If review regularly runs long, the trial saves little. Q6's headroom metric is there to test exactly that.

## Conformance conflict (approved by Hari 2026-11-01, done in T2)
AGENTS.md says "After opening a PR, enable auto-merge". Executor PRs must not. CLAUDE.md is auto-loaded by Claude Code, so Flash will read that rule too. Proposal: add an exception line in AGENTS.md ("executor PRs: Opus enables auto-merge after review") with `decisions/deepseek-executor.md`. The run's prompt also overrides it.

## Tasks (after "go")
- T1. Workflow and scripts (Sonnet). Files: `.github/workflows/deepseek-exec.yml`, `scripts/executor/preflight.mjs`, `scripts/executor/gate.mjs`, `scripts/executor/prompt.md`. Done when: a dispatch with a non-Haiku task fails pre-flight; a dispatch with a Haiku task opens a PR with the body from Q4; the gate rejects a test patch touching `TODO.md`. Don't touch: `ci.yml`, `update-baselines.yml`.
- T2. Docs (docs-only, push to main). Files: `AGENTS.md` (exception line and "Haiku tasks list exact paths" rule), `decisions/deepseek-executor.md`. Done when: both on main.
- T3. Hari. Add `DEEPSEEK_API_KEY`. Tick the Actions PR setting. Top up a small balance.
- T4. Dry run (Opus reviews). One copy-only task. Done when: PR merged and deployed.
- T5. Trial of 5 tasks. Log each in `progress/deepseek-trial.md` with the Q6 metrics. Done when: keep, tune or stop decision.

## Prompt rules carried from Haiku threads
- Run `npm run typecheck`, `npm test` and only the touched specs. Never the full e2e.
- Known failures on main are listed in the task; ignore them.
- Fixed scope from `Files:`. No refactors.
- Blocked or failing for a reason outside the change: set `failed` and stop.
- Never update screenshot baselines.
- Write `decisions/` and `progress/` files named `<plan>-<task>.md`. Never edit TODO.md.
- Any choice the plan didn't settle: `stopped` with the question. Never guess.

## Open questions
- Effort level: DeepSeek's guide uses `max`. Keep it for the trial, or drop to save output tokens?
- Off-peak only? A cron-free rule "dispatch outside 09:00–12:00 and 14:00–18:00 SGT" halves cost. Probably not worth the friction at these amounts.
