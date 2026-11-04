# CI: a record of flaky tests, and English when the strings change

The first part of the TODO item "CI and test config: flaky reports, English, WebKit, nightly, console-error fixture and canaries". It covers TESTING.md items 2 and 9.

- **Flaky tests leave a record (item 2).**
  - CI already retries a failed e2e test once. A test that passed on the retry used to leave no trace.
  - Playwright now also writes a JSON report (`reports/results.json`). After every shard, green or red, `scripts/flaky-summary.mjs` prints the shard's failed and flaky tests into the job summary.
  - The JSON is uploaded as an artifact on every run, for 14 days. The weekly English workflow does the same.
  - `tests/flaky-summary.test.ts` checks the parser on a fake report.
- **English when the strings change (item 9).**
  - The `changes` job also reports whether a PR touches `src/i18n/`. If so, a new `e2e-en` job runs the whole suite in English at 412px, in two shards.
  - The `ci` gate fails if that job ran and failed, and passes if it was skipped. A PR that changes no strings pays nothing extra.
  - AGENTS.md and CLAUDE.md now say so.
- **Not in this change:** WebKit, a nightly e2e run, the console-error fixture and the canaries. They stay open in TODO.md. The fixture needs a full-suite run to set its allowlist, and that run belongs in CI.

## English on main, 2026-11-04
A dispatched English run on main failed only on the "Facilities" Build tab. The word is 3px wider than its tab at 320px, both in the RW build menu and with large text. The English tab is now "Public". The Indonesian "Fasilitas" already fit. This PR touches `src/i18n/`, so its own CI runs the new English job.
