# Place and Cancel flashed at the map's corner for one frame

Follow-up to `decisions/flaky-place-float.md` (#454). After that test-only fix, the spec still failed once at 320px in two CI runs in a row (#454 run 43644558559, #455 run 43649475849), each passing on retry.

## Cause (from the failure message #454 added)
`{"fb":{"x":0,"y":62,...},"at":{"x":192,"y":203},"box":{"x":0,"y":62,...}}`: the float sat at the map's top-left corner, its unplaced default, while the tile was in the middle. `updatePlacing` un-hides `#place-float`, but `positionPlace` only ran from the animation frame (`frame()`), so for one frame the buttons showed at the corner. A test that reads the box in that frame fails; a player sees a one-frame flash.

## Fix
`updatePlacing` now places the float right after filling it (`fillPlacing`, then `positionPlace`), so it is never shown unplaced. The per-frame call stays, for pans and zoom.

## Checks
- New e2e "the Place and Cancel float is under its tile in the same frame it appears": moves the ghost and reads the float in one JavaScript turn. Fails without the fix (172 px off, as in CI), passes with it.
- Both specs, `--repeat-each=10` at phone-320-id, phone-430-id and phone-412-en: 60 of 60. Build-mode, path, Decor and move specs at 320 and 430: 54 passed. `npm run typecheck`.
