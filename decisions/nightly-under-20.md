# The Nightly under 20 minutes

TODO item "Finish the scorecard: a Nightly under 20 minutes and the forced worst-event chain", first half.

## What was slow
Nightly run 44432894622 (2026-11-19) took 28.9 min. Job times:
- `screen-bot (screenbot-412-en)`: 28.9 min. The bot plays a 14.1-minute game, fails its checkpoint bar, and Playwright's CI retry (`retries: 1` in `playwright.config.ts`) plays the same game again. Both tries scored 3 of 46 checkpoints. The bot is deterministic, so the retry only doubles the time.
- `scorecard-kec (7,8)`: 20.7 min, about 10 min a seed. The report waits for the slowest Kecamatan job, so the scorecard landed at about 22 min.
- Every other job is under 7 min (bot runs about 1 min each).

## What changed
- **`scorecard-kec` runs one seed per job** (10 jobs, was 5 pairs). `run-kec` already writes one `kec-<seed>.json` per seed, and the report reads them all, so nothing else changes. Expected: about 11 min a job, the report by about 13 min.
- **The screen bot runs with `--retries=0`.** It still fails when it fails, with the same artifact and summary; it just stops replaying the same game. Expected: about 15 min.

No test is skipped and no bar moves. TESTING.md ("CI keeps 1 retry") is about the PR suite, where a retry tells a flake from a failure. It still holds there. The screen bot is a Nightly-only, deterministic playthrough, so a retry cannot reveal a flake.

## Not changed
- The screen bot's failure itself (412-en 3 of 46 checkpoints, bar 90%; 360-id a click timeout). It is chronic, known since the bot landed, and is a new TODO item.
- The `properties` job (1000 games per rule). It is not on the critical path.

## Verdict
Self-approved under the TODO rule. The next Nightly is the check: wall time under 20 min.
