# Determinism and property tests

- `newGame(seed)` now needs a seed. `src/app.ts` picks it from the clock (`freshSeed`); `src/sim/` never reads time.
- `tests/sim-purity.test.ts` fails on `Math.random`, `Date.now`, `performance.now` or `new Date` under `src/sim/`.
- `tests/properties.test.ts` (fast-check): stars never drop, no negative counts, no soft-lock, save round-trip, same seed same game. 200 games each; set `PROP_RUNS=1000` for the nightly run.
- `tests/save-compat.test.ts`: old version, unknown building, corrupt JSON and missing fields all load as null.
- Bug found: `newGame` left out `parkirSeen`, so a save round-trip added it. Now set in `newGame`.
- Not done: the start-new prompt in the UI (TESTING.md item 10), and the builder-bot takeover soft-lock check. The soft-lock test checks that time advances and a pending event can be answered.
