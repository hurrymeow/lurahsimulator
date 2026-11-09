# Screen-bot scorer: a wait forced by money is right

The screen-only bot's scorer marked a `wait` row wrong whenever no star line moved, even when the player was correctly saving for a building they could not yet afford. `score` now takes an optional `unaffordable` flag; for `wait` rows the spec computes it from the row's `before` snapshot alone (named building defs the player owns none of, all costing more than `before.res.rupiah` via `buildCost`) and the scorer returns right with reason "saving: could not afford the named building". The player in `tests/e2e/screen-bot.ts` is unchanged and receives nothing from the snapshot; only the recorder/scorer reads it.

Review (Claude, 2026-11-09): diff matches the task and touches only the listed files.
