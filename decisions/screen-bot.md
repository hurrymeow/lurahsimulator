# Screen-only playtest bot (T2 of docs/plans/first-2h-playtest.md)

- The player (`tests/e2e/screen-bot.ts`) reads the goal pill, the opened pill and the Build cards, and taps. It never reads `window.pakrt`. A unit test greps it for that.
- `?debug` is on only so the recorder (`screen-bot.spec.ts`) can snapshot the sim. Nothing the recorder reads goes back to the player.
- Rule: build a building named on screen that is affordable and not yet owned; else build another if the star still waits; else wait; no name on screen is "can't tell" (wrong).
- Scorer (`screen-bot-score.ts`): a checkpoint is right if an unmet star line's have rose or a star came by the next checkpoint (60s of game time later). A wait is right if a build was under way.
- Plays at 2x on a fake clock. Sheets and popups freeze game time. Projects `screenbot-412-en` and `screenbot-360-id` exist only with `SCREEN_BOT=1`. Nightly job `screen-bot` uploads the CSV, a summary and miss screenshots.
- Local run: about 8 to 10 min per project. The run stops at 14 min wall time and still writes its CSV.
- Early findings (local, 412 EN): the screen never says a house needs a road, and "No road" shows only on the map. Placement works without one. Combo goals name the combo, not always its pieces. A first local run scored 78% with RT 3★ not reached in 20 min: a result for the report, not a fix here.
