# Screen-bot scorer: money-forced waits

- `tests/e2e/screen-bot-score.ts`: `score` gains an optional `unaffordable` fourth argument; a `wait` with it true is right, reason "saving: could not afford the named building".
- `tests/e2e/screen-bot.spec.ts`: computes that flag per row from `before` only, matching named buildings via `allDefs`/`bName` and comparing `buildCost(before, def)` with `before.res.rupiah`.
- `tests/screen-bot.test.ts`: unit test for the new argument, including that it does not change a `build` verdict.
