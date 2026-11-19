# The Nightly under 20 minutes

- `scorecard-kec` runs one seed per job (10 jobs), and the screen bot runs without Playwright's CI retry, which replayed the same deterministic 14-minute game. Expected wall time is about 15 min, down from about 29. Notes: `decisions/nightly-under-20.md`.
