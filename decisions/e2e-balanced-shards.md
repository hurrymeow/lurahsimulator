# e2e balanced shards

- `fullyParallel: true` so Playwright shards per test, not per spec file. Before: 105/105/52/52 tests over 4 shards. After: 79/79/79/78.
- `workers: 2` in CI. More caused the fps tests to flake (see #46).
- Dropped `localStorage.clear()` + `reload()` in `start()`. Each test has a fresh context and boot never writes a save.
- e2e job runs in `mcr.microsoft.com/playwright:v1.63.0-noble`. Keep the tag in step with `@playwright/test`.
- Matrix, assertions and fps repetitions are unchanged.
