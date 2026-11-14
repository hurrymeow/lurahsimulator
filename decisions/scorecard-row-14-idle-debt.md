# Scorecard row 14: idle debt is by design

Item 14 (cash health) no longer fails when the idle bot's cash goes negative. `GAME-DESIGN.md` §8 item 14 now asks only that the builder's cash never drops below 0. The recorder was right: after the grace weeks, `safetyNet` in `src/sim/tick.ts` stops resetting cash to 0 and drains Popularitas instead, so an idle player's debt is the intended punishment, not a cash-health fault. The scorecard still reports the builder's lowest cash and keeps the "cash over 5x the next key item" bar.

Counter, kept open: unbounded debt could mean the simulation needs a floor. We did not add one because the Popularitas drain already stops a player from idling, and the builder's cash is still checked. If a future bot or stage shows debt with no drain, revisit the floor.
