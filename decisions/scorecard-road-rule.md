# Scorecard bots run with the road rule on

`tests/setup.ts` turns the road rule off for every test, so the scorecard bots could build with no path and the numbers flattered the game. `runBot` now turns the rule on for the run and off again when it ends (`tests/scorecard/driver.ts`).

The driver already places road-fed buildings beside a Jalan Setapak (`spotFor`, `laySetapak`), so no new path-laying logic was needed. Counter-argument: the bots lay a full street grid at tick 0, which a player does not. That stays as the bot's player model.

Verdict: pending. The before/after numbers for the nine player types come from the Nightly run on main after this merges; a follow-up decisions note records them. Follows the docs.
