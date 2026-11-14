# Scorecard bot fixes T3: off-road pieces move, a blocked combo copy clears a site

`driver.ts` gains `moveOffRoad`, called after `keepDrains`: in the RT stage it takes the first building with `noRoad` that is not a decoration, not in `FLAT` and not a Kantor, and when `spotFor` finds a site and cash covers the buffer plus the build cost, it demolishes and rebuilds it beside a path (one move per call). In `buildCombo`, the "Every piece is on the map but none touch" branch now also handles a failed copy buy: below the copy cap it demolishes the road-fed Sawah, Kebun Sayur or decoration nearest the anchor that is not a piece of a discovered combo, then buys the copy beside the anchor (one clear per call). Both follow the Pos Ronda/Sawah swap the bot already does. This was the T2 review trace: takeover seed 3 stalled because no free road-fed site existed for WiFi to land beside a Pos Ronda.

## Game finding

`takeover(seed, 'random', 100)` still returns `gained: false` for seeds 3 and 5. State at the end of the 150-tick window (builder took over the random state):

| seed | stage | stars | cash | residents | off-road buildings | debt households |
| --- | --- | --- | --- | --- | --- | --- |
| 3 | rt | 0 | Rp 8,868,253 | 68 | 11 | 0 |
| 5 | rt | 0 | Rp 234,792 | 35 | 5 | 0 |

Neither stall is for lack of cash alone: seed 3 holds Rp 8.9jt and still ends the window with 11 off-road buildings, so the missing road-fed site is a map-space problem; seed 5 holds only Rp 235k, under any rebuild's price. The new moves did not find a usable site for the WiFi copy, so the soft-lock remains a space finding.
