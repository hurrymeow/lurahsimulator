# The screen bot reads the gold combo tint

TODO item "The Nightly screen bot fails every night", second cause (the first: `decisions/screen-bot-taps-float.md`).

## What was wrong
- **The symptom:** after #474, `screenbot-412-en` stalled on "Goal: combo Rapat Malam" for the rest of the run. The step says "Place side by side: Kantor RT, Pos Ronda", and the bot put Pos Ronda wherever a tap first worked.
- **The game is right:** while a combo's piece is in hand, the free tiles beside its partner glow gold (#402, `docs/plans/combo-join-highlight.md`). A player sees them. That plan left "the screen bot uses the tint" as a later call (T3); this is that call.

## What changed
- **`placeOnMap` (tests/e2e/screen-bot.ts) taps gold tiles first.** It reads the map canvas's pixels, which is what a screenshot shows, not the game state; the file still never touches the debug handle (`tests/screen-bot.test.ts` greps for it).
- **How it finds the gold:** the glow shows only once the building is on the map, so the bot taps once, then compares the canvas with the one from before that tap in 6px cells. Gold cells that are new, in a patch of at least 6 of 9, are the tint. Gold within 40px of the first tap is the building in hand, not the tint. Yellow fields at the map's edge are there before and after, so they drop out.
- **No gold, no change:** the bot taps in rings round the map's middle as before.
- **A unit test** checks the patch rule on a made-up bitmap.

## Result (local, 412 en)
- **22 of 63 → 61 of 85 checkpoints right (72%).** Rapat Malam forms (at about 6.5 min at 1x), and the run reaches Sayur Segar.
- Still failing: bar 90%, and RT 3★ by 12 min.
- **The next blocker:** ring taps start at the map's middle, where the Kantor RT stands, so the first Rumahs fill every free tile round it. The first two Pos Ronda found no free gold tile; the third did. A player builds houses along the road and keeps the office's sides free once the combo is named. Most of the remaining wrong rows are the waits on this combo (80 to 336 s), then Sayur Segar's Kebun Sayur and Warung level (864 to 984 s).

## Verdict
Self-approved under the TODO rule. A test-harness fix; no game change. `npm run typecheck`, `npm test` and a local `SCREEN_BOT=1` run at 412 en.
