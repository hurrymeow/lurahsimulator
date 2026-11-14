# The flaky "Place and Cancel sit right under the chosen tile" test

TODO Now item. The spec (`tests/e2e/ui.spec.ts`) failed both tries on some runs at 320px and 430px, turning main red at 9442893.

## Cause (traced in code)
`startPlacing` hides the main bar and shows the placement bar, so the map element changes height. The map re-lays out only on the next `ResizeObserver` callback (`src/app.ts`, `view.resize()`), which moves every tile's screen position. The test read the map box and the tile centre right after `startPlacing`, so on a slow runner it aimed with numbers from before the resize and compared the float with them. The pan in `startPlacing` is instant (`centreOn` calls `panBy`), so it is not the cause.

## Fix (test only; the game is right)
- Before tapping, wait until the map box and the target tile's centre hold still for two animation frames.
- Measure the float against the tile the ghost sits on, read after the float shows, with a fresh map box.
- Every assertion carries the float box, the tile centre and the map box in its message, so a future failure says where they were.
The bars are unchanged.

## Checks
`--repeat-each=20` at phone-320-id and phone-430-id: 40 of 40 pass. The second half of the done-when (two PR CI runs in a row with no retry on it) is checked on this PR and the next.
