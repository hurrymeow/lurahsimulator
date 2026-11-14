# Random bot path laying (T4)

Added `if (c.s.stage.current === 'rt' && c.t === 0) laySetapak(c);` at the top of `playRandom` in `tests/scorecard/driver.ts`, with a local `tests/scorecard/measure-T4.test.ts` (skipped unless `MEASURE=1`) that prints the figures below.

Before: `runBot('random', seed, 450)` reached RT 1★ on 7/10 seeds — 1: 28.3 min, 2: 12.0, 3: 17.3, 4: 10.4, 5: 26.7, 6: never, 7: never, 8: 11.9, 9: never, 10: 5.3. After: 9/10 seeds — 1: 5.5, 2: 9.6, 3: 9.7, 4: 6.0, 5: 17.2, 6: 14.5, 7: never, 8: 18.5, 9: 10.3, 10: 5.7. Takeover (`random`, 100 ticks, builder window) seeds 1-5 `gained` went from true/true/false/true/false (3/5) to true/true/true/true/true (5/5).
