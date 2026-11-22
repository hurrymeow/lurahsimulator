# The screen bot tapped the Place/Cancel float

TODO item "The Nightly screen bot fails every night", first cause.

## What was wrong
- **The symptom:** `screenbot-412-en` scored 3 of 46 to 55 checkpoints every night and never reached RT 3★. The CSV, reproduced locally with `SCREEN_BOT=1 npx playwright test --project=screenbot-412-en --retries=0`, had 52 of 55 rows "the tap path failed: no spot or card found". The first came at the 5th Rumah. From then on every build failed, Rumah and Pos Ronda alike.
- **The cause:** `placeOnMap` taps in rings round the map's middle until Place turns on. After a blocked tile, the game shows the Place/Cancel float right under that tile. The bot's next taps, 28px away, landed on the float, its Rotate button and then its ✕. The ✕ ends placing, so the remaining taps did nothing. A throwaway spec logged what each tap hit: taps 3 to 5 hit the float, and tap 8 hit `#place-cancel`.
- **The game is right:** a player taps past the float, or uses it, and never mistakes it for the map.

## What changed
- **`placeOnMap` (tests/e2e/screen-bot.ts) skips any point not on the map canvas.** It asks the page what lies under the point (`document.elementFromPoint`). That is a screen read, not the game state, so the file still never touches the debug handle; `tests/screen-bot.test.ts` greps for it.

## Result (local)
- **412 en:** 3 of 55 checkpoints right → **22 of 63**, with no failed tap left.
- **360 id:** the Nightly stopped on a click timeout after about 5 min. It now plays the whole 12.6-min run, 23 of 82 right.
- Still failing (bar 90%, and RT 3★ by 12 min).
- The next blocker: the step says "combo Rapat Malam" (Kantor RT and Pos Ronda side by side). The bot builds Pos Ronda wherever a tap first works, not next to the Kantor RT, so the combo never forms and it waits for the rest of the run. The game marks the right tiles with a tint, which the bot cannot read (`decisions/scorecard-bot-fixes-nightly.md`). Placing pieces of a named combo next to each other is the next step for this item.

## Verdict
Self-approved under the TODO rule. A test-harness fix; no game change. `npm run typecheck` and `tests/screen-bot.test.ts` pass.
