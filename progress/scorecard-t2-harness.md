# Scorecard harness reads the T2 specs

- `scripts/scorecard-t2.mjs` (`npm run scorecard:t2`) runs `tests/e2e/scorecard-t2.spec.ts` at 412px in id and en and writes Playwright JSON reports to `scorecard/.cache/t2-<lang>.json`. `npm run scorecard` runs it before the report.
- `tests/scorecard/t2.ts` parses the reports; `buildScorecard` takes the results for rows 3, 6 and 27. No report means Unknown with the command to run.
- Row 27's spec also checks the goal line after reload and records whether progress shows without a tap.
- Row 6 spec no longer flakes: it sets a pending event aside before the tick (60 of 60 runs passed at all widths).
- Nightly: new `scorecard-t2` job (Playwright container, about 3 min); the report job still runs if it fails.
- Local run on 2026-11-07, both languages: row 3 Pass, row 6 Pass, row 27 Fail (progress is a tap away). Unit test in `tests/scorecard/harness.test.ts` covers pass, fail, flaky, skipped, a missing language and the row 27 progress note.
- Decisions: `decisions/scorecard-t2-harness.md`.
