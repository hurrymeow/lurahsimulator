# CI: a console guard, canaries, WebKit nightly, property tests nightly

The rest of the TODO item "CI and test config". It covers TESTING.md items 5, 6, 13 and 15. Items 2 and 9 shipped in #299.

- **Console guard (item 5):**
  - `tests/e2e/fixtures.ts` extends Playwright's `test` with an automatic fixture that collects `pageerror` and `console.error` events, and fails the test that caused them.
  - Both spec files import `test` and `expect` from it.
  - The allowlist starts empty: a run of the whole `ui.spec.ts` at 320px (136 tests) logged no errors. Any entry later needs a reason next to its pattern.
- **Canaries (item 15):** `tests/e2e/canary.spec.ts` plants a fault for each check and expects it to be caught:
  - a clipped label, small text, an ellipsis and a 30px button for the legibility scan;
  - a top-heavy button for the centring scan;
  - an 8-word button for the label-word scan.
  - It also checks that the page listeners see a `console.error` and a page error, and that the guard fails a test whose page logs one (an expected failure via `test.fail()`). With `test.fail()` removed, that test fails, as it should.
  - The planned layout-shift canary is left to the screenshot baselines, which only run in CI's image.
- **WebKit nightly (item 13):**
  - `E2E_BROWSER=webkit` turns the phone projects into `webkit-phone-<width>-<lang>`.
  - The new `e2e-webkit.yml` runs `ui.spec.ts` and the canaries in WebKit at 412px ID, nightly and by hand, in three shards. It skips the Chromium-drawn screenshot baselines.
  - It is not a PR check: WebKit cannot run in this container to verify first, so a failure becomes a TODO item rather than a blocked PR. It was dispatched once on this branch to see its result.
- **Property tests nightly (item 6):** `nightly.yml` gains a `properties` job with `PROP_RUNS=1000`. It takes about 40s.
