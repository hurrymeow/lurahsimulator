# Visual baselines pause the clock

2026-11-03. `tests/e2e/visual.spec.ts` said its clock was frozen, but `page.clock.install` keeps time running at real speed, so a slow runner could reach the welcome toast's exit sooner than a fast one. `open()` now calls `page.clock.pauseAt` after load, so only `settle` moves time. The new game's seed, which comes from `Date.now()`, is now the same every run too.

Visual tests skip outside CI, so this was checked locally with `CI=1` against throwaway Windows images, which were not committed. 25 of 25 repeats passed at the normal tolerance. 10 of 10 matched at zero tolerance with a 5 s real-time stall before every `settle`. CI's own Linux baselines can only be checked on a PR run.
