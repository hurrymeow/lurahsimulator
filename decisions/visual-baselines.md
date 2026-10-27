# Screenshot baselines

Hari approved (2026-10-27): baselines for home, HUD at start, Build sheet, event popup and tip card.

- 412px only, EN and ID, so CI time stays flat. The width and language checks stay in the main suite.
- Frozen clock, reduced motion, same seed each run. The home map is hidden because it still drifts. The fill and edge checks cover it.
- Baselines are drawn in CI's pinned Playwright image through the `Update baselines` workflow, not locally.
- A change to the baselines needs the before and after in the PR. Rule is in UI.md.
