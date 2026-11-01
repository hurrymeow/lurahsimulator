# DeepSeek executor T1

Added `.github/workflows/deepseek-exec.yml` and `scripts/executor/` (preflight, gate, keyscan, prompt). Plan: `docs/plans/deepseek-executor.md`.

- Job `execute` holds the DeepSeek key and a read-only token. Job `publish` holds a write token and no model.
- Pre-flight refuses non-Haiku tasks and tasks without exact file paths.
- Gate: Files list only, hard-deny list, 12 files, 400 lines, no binary or symlink, key scan.
- Executor PRs never enable auto-merge.
- Needs from Hari (T3): `DEEPSEEK_API_KEY` secret and Settings > Actions > "Allow GitHub Actions to create and approve pull requests".
- Not yet run end to end: that is T4.
