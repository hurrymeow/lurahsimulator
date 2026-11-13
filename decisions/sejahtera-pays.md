# Sejahtera now pays shop income

TODO item "Sejahtera, the Kerja meter and Indonesia Emas change almost nothing". Done for Sejahtera and Kerja. Emas is left.

## Change
Shops earn up to **25%** more as Sejahtera climbs from 50 to 100 (`SEJAHTERA_SHOP`, `sejahteraShopMult` in `src/sim/tick.ts`). Nothing below 50, so a young or small kampung is never taxed and the first 15 minutes stay as they were. Kerja counts because it is a third of Sejahtera. Aman is the cheapest lever: every bot ends the Kelurahan with Aman 0 and Sejahtera 50 to 59, so doing it for real (Pos Ronda, Lampu) has room.

## Evidence (honest and builder, seeds 1 to 3, star weeks)
- Main against this change at Sejahtera 56 to 59: stars within one quarter of each other (RT 3★ to Kel 3★ at 372 against 360 to 396 before). The bonus is about +2%, below the quarterly noise.
- Aman base +60 (a stand-in for a player who fixes safety): honest RW 1★ at 95 to 101 against 102, and RW 2★ at 101 to 107 against 108. Honest seed 1 RW 1★ comes 7 weeks earlier. Later stars stay quarter-gated.
- Late stars still follow the quarterly rankings, not income. The star-time-follows-play item covers that.

## Not changed
- Indonesia Emas still adds a point or two to the ranking. Raising `perEmas` moves every ranking win, which is the other TODO item's job.
- The 2045 ending that reads Sejahtera is not built.
- GAME-DESIGN.md §2 gets one line on the shop bonus.

Verdict: self-approved under the TODO rule. Nightly confirms the other seeds.
