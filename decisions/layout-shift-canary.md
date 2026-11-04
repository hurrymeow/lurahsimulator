# A layout-shift canary for the screenshot baselines

TODO item "CI: a layout-shift canary, and act on the first WebKit nightly" (first half). TESTING.md item 15: every check is shown a planted fault and must catch it.

- `tests/e2e/visual.spec.ts` gains `canary: a layout shift fails the screenshot diff`. It draws the home screen the same way as the `home` baseline, moves `#home-start` down 8px, and compares against `home-id.png` with the same `SHOT` options. It is marked `test.fail()`, so it passes only if the diff catches the shift.
- It lives in `visual.spec.ts`, not `canary.spec.ts`, because baselines exist only in CI's image at 412px Indonesian, and that file already skips everywhere else.
- It skips when Playwright runs with `--update-snapshots` (the update-baselines workflow), so it never writes the shifted frame over the real baseline.
- Why 8px: the start button is about 300px wide, so a shift changes several thousand pixels, well past `maxDiffPixelRatio: 0.002` (about 750 of the 412px screen's pixels). A shift that small still reads as a layout bug to a player.

Verdict (self-approved): it runs in CI's visual shard on this PR; a pass there means the diff caught the shift.
