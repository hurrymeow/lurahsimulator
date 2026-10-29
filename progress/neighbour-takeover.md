# Player-run neighbour RTs

- `takeover`, `handBack`, `checkTakeover` and `syncArea` in `src/sim/grow.ts`. `NEIGHBOUR.takeoverOd` is 3.
- Player cells in `lotAt` (`setPlayerCells`, `areaVersion`) in `src/sim/area.ts`. Synced in `newGame`, `deserialize` and `promote`. The walker lot cache rebuilds on change.
- Player-run view in `src/sim/neighbourView.ts` (`inCell`, a cell view). The area score skips player-run RTs.
- Neighbours screen: an explanation of both modes, a Take over button with its reason, and a player-run row with its checklist and Hand back.
- Tests: cost, refund and lots; stars from the RT's own lots; hand-back and the save round trip; own-RW rule; the area score counts it once. e2e: take over, tap its Kantor (it opens the building, not the Neighbours panel), hand back.
