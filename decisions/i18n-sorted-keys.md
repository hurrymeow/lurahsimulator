# i18n keys sorted A to Z

- **Problem:** every PR appended strings at the end of a section in `en.ts` and `id.ts`, so parallel PRs conflicted (seen on #137).
- **Decision:** sort all keys A to Z in `en.ts`, `id.ts`, `higher-id.ts`, `id-content.ts` and `id-data.ts`. Section comments were dropped, since the key prefix (`menu.`, `tutorial.`) now groups them. No string text changed.
- **Not enforced by a test:** a sort test would fail every open PR that still appends. CONTRIBUTING.md asks for in-place inserts instead.
- **CI caching and baselines:** already done. npm is cached via `setup-node`, the Playwright image ships the browsers, and visual baselines are 412px Indonesian only (5 files).
