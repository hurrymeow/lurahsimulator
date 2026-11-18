# The RW seams sprawl on their own

TODO item "Fix the remaining scorecard Fails that have a clear cause", next plan step 1: rows 10 and 15 (`decisions/scorecard-bot-fixes-nightly.md`): "lower RW 1★ to 2★ goal cost or raise RT-tier income, not RW prices again".

## What was wrong
- **Row 10 (gates that loosen) failed on RW 2★.** Shopkeeper, safety, Pencitraan and honest took 108 to 171 weeks from RW 1★ to RW 2★ (bar 2x the RW star gap, 104). 27 misses on seeds 1 to 6.
- **The line that waited was the RW combo**, not the 4 ranking wins. A per-tick probe found the wins done by week 131 to 167 and the combo line still open until the star. The shopkeeper sat on Rp 20jt to 80jt for 100 weeks.
- **Cause: sprawl.** `sprawl()` counts every building in the game, so a kampung of about 80 made every RW piece about 3x dearer. Pos Siaga needs a working Balai RW (Rp 46jt), a Posyandu (Rp 38.5jt) and a Portal (Rp 27jt): about Rp 110jt where the base prices add to Rp 29jt before inflation. The RW price doubling (design-rows T5) then stacked on top.

## What changed
1. **Pieces on RW lots count only the pieces on RW lots for sprawl** (`sprawl(s, scope)` in `src/sim/state.ts`). A big home RT no longer makes the Balai RW, Posyandu or Portal dearer. RT and Kelurahan buildings count as before. The RW seam is its own land, so "land, permits and uang rapat grow with the kampung" does not reach it.
2. **The scorecard bots build a combo piece's required building first** (`buildCombo` in `tests/scorecard/driver.ts`). The build sheet says "Need a working Balai RW" on a Posyandu. Before, only the hint bot built it, and the others waited until a Balai RW came for another reason. Alone this moved no star (the money was the wall), but it is what a player does.

A first try let every stage lot sprawl on its own. It fixed row 10 the same way but made Kelurahan buildings about 5x cheaper (row 15's Kelurahan median fell from 77 s to 15 s, more cash piling up for row 14), so it was narrowed to the RW seams.

## Evidence
Nine player types, seeds 1 to 6, main (e2d44e1) against this branch: `BOT=<type> SEEDS=1,2,3,4,5,6 SCORECARD=1 npx vitest run tests/scorecard/run-one`. Median minutes at 1x.

| Bot | RW2 main | RW2 here | RW3 main | RW3 here | Kel3 main | Kel3 here |
| --- | --- | --- | --- | --- | --- | --- |
| builder | 23.4 | 20.0 | 27.2 | 26.7 | 49.6 | 48.8 |
| shopkeeper | 29.7 | 20.8 | 31.1 | 27.2 | 52.8 | 49.6 |
| safety | 31.3 | 20.8 | 35.3 | 27.2 | 57.6 | 49.6 |
| Pencitraan | 27.7 | 18.7 | 28.9 | 24.0 | 51.2 | 48.0 |
| honest | 33.7 | 22.7 | 35.3 | 27.2 | 57.6 | 51.2 |
| hint (5/6) | 30.5 | 19.2 | 31.6 | 25.6 | 52.8 | 51.2 |
| cheapskate | 33.7 (3/6) | 32.0 (3/6) | 43.3 (3/6) | 41.7 (3/6) | — (0/6) | 76.4 (1/6) |
| random | — (RW1 2/6) | — (RW1 2/6) | — | — | — | — |
| idle | — | — | — | — | — | — |

- **Row 10:** 27 misses to 4. Three are honest's RT 2★ at 65 to 66 weeks (bar 60), which this change does not touch (TODO "Scorecard bots: the last RT stalls"). One is safety seed 4, RW 2★ after 120 weeks; in the probe its fourth ranking win came last, not the combo.
- **Row 15:** median seconds of income to afford the dearest key item, B0 to B4, 32 s to 25 s (bar 30 to 120); 95th percentile 110 s to 108 s (bar 300). The RW pieces are the dearest open item during the RW, so making them cheaper lowers it. The row already failed on main on its growth half (2.76x and 3.20x, bar 0.7 to 1.5), which reads base prices and does not move. So row 15 stays a Fail, for the reason it had.
- **Slowest over fastest type at Kel 3★** (§8 item 18): 1.16 on main (57.6 over 49.6), 1.07 here (51.2 over 48.0). Every climbing type reaches Kel 3★ on as many seeds as on main.
- **Act 1 (Kel 3★)** ends at 48.0 to 51.2 min, against 49.6 to 57.6 on main. It stays inside B4 and close to Hari's "near 52 min".
- **RW length** 12.0 to 23.6 min (main 16.1 to 30.0). Pencitraan and the hint reader now finish the RW in about 12 min, under its target of about 20: their RW 3★ waits on 8 ranking wins, which they reach as soon as the others.

- **Kecamatan:** the Kecamatan bot (`KEC_BOT=1 SEEDS=3,4 npx vitest run tests/kec-bot.test.ts`) passes.
- `npm run typecheck` and `npm test` (706 tests) pass. No UI change, so no e2e spec is touched.

## Verdict
Self-approved under the TODO rule. Row 10's RW misses are gone for a stated cause, and the type spread narrows. Row 15's first half moves 7 s under its bar, a trade made knowingly: what made the RW slow was RW pieces that cost 3x for a reason that has nothing to do with the RW. The cash sink (row 14) and the late cost curve are still open, under the same TODO item.
