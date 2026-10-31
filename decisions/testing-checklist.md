# Testing checklist

Date: 2026-10-31. Decided by Hari in the thread "Plan review checklists for game quality".

## What changed

- New TESTING.md: 19 items on whether the test suite can be trusted as the agents' eyes, each with a quoted source, sub-checks and a pass bar. Linked from AGENTS.md.
- Approved CI changes, code pending (TODO.md):
  - English e2e at 412px in PR CI when `src/i18n/` changes. This narrows `decisions/default-lang-id.md` ("English is not in CI") to "English runs when text changes".
  - A WebKit Playwright project: 5 smoke specs on every PR, the full suite nightly.
  - A nightly CI workflow for heavy checks (property tests, PWA, perf gates, WebKit, monkey and soak runs). This is a CI schedule, not a recurring agent.
- Saves: no migrations. An incompatible save tells the player and offers a new game (Hari).

## Why

- Hari wants agents to replace manual playtesting and review. That only works if the suite is deterministic, reports its flakes, and covers real phones.
- Every iPhone browser runs WebKit, and the suite ran Chromium only.
- An independent agent review of the first draft corrected facts about the suite and sized each bar against CI time.
