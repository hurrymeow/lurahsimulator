# Playtest bot gaps T2: saving for a locked building

The screen-only bot (`tests/e2e/screen-bot.ts`) used to build another copy of an already-owned building whenever the goal named one. That threw away money the goal also asks the player to save toward a locked building. `decide` now returns `wait` with `saving for: <names>` when any other named building on screen is locked and owned 0, before falling back to building another copy. Text and cards only; no state is read. The new unit test covers both the saving case and the unlocked case that still builds.
