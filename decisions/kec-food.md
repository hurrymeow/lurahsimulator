# The Kecamatan starts hungry: food from markets, minimarkets and farms

TODO Now item "Kecamatan starts with households that have no food" (`decisions/playtest-bot-gaps.md`, finding 2; Hari, 2026-11-09: fold into tuning). Taken over by the daily sweep on 2026-11-11 (#409).

## What was wrong
Only a Warung Sembako (4, 7 or 10 households at levels 1 to 3) and an old Toko Kelontong (10) fed anyone. A Pasar, an IndoApril, a Sawah or a Kandang Ayam fed no one. At Kelurahan 3★ every climbing bot had about 141 to 146 households and food for 30 to 40, though each owned 2 Pasar, 2 IndoApril, 2 BetaMart, a Pasar Kaget, 3 or 4 Rumah Makan and 12 farms.

In the Kecamatan a household borrows only when it is hungry or long idle (`pinjolSystem`); judol only doubles the rate. On the hint path (promotion at weeks 409 to 433, about 460 residents) 105 of 155 households stayed hungry, so pinjol sat at 55 to 71% against the 1★ limit of 25%, and no Kecamatan star came in 700 weeks. Viral at 85 to 87 put 120 households on judol, which doubled the borrowing but did not start it.

## What changed
`NEEDS.feedsBy` (`src/sim/needs.ts`): households fed at any level by Pasar **20**, Pasar Kaget **8**, IndoApril and BetaMart **6**, Sawah **4**, Kebun Sayur, Kandang Ayam, Kolam Lele and Rumah Makan **2**. The Warung stays the main source early on: an RT at 2★ with one minimarket gains 6 households. The Harga Sembako cut applies to all of it.

The numbers feed about the 141 households the climbing bots hold at Kelurahan 3★ with what they already own. The Kecamatan's growth past that still asks for more Warung.

## Evidence
Hint path through the Kecamatan (`SCORECARD=1 SEEDS=1,2,3,4 npx vitest run tests/scorecard/run-kec`):

| Seed | Main | Here |
| --- | --- | --- |
| 1 | 0 stars, pinjol 68% (from #389's Nightly and a local rerun) | 1★ at week 113 after promotion, pinjol 19% |
| 2 to 4 | 0 stars, pinjol 55 to 71% (Nightly) | 1★ at week 113, pinjol 13 to 16% |

Only 1★ comes in 700 weeks: 2★ needs every district at 2★ (200 weeks of progress) and Aman 60+ for 24 weeks, which this item does not touch.

Nine player types, seeds 1 to 6, main against this branch (median minutes at 1x):
- Every climbing type keeps every star from RT 1★ to Kel 3★, except the builder's Kel 2★ and 3★, 0.8 min later (one seed one quarter later).
- Popularitas at the end of the run is 5 to 10 points higher for every type that builds (builder 44 to 54, hint 45 to 55, honest 49 to 55, shopkeeper 54 to 61): fewer hungry households drain it.
- Random placer: RT 3★ on 6 of 6 seeds (was 5). Cheapskate: RW 2★ on 0 of 6 (was 1); it stays not stranded (`decisions/stage-lengths-quarterly-wins.md`).
- The scripted Kecamatan bot (`KEC_BOT=1 SEEDS=3,4`): passes on both seeds, stars at the same weeks as before (113, 250 and 425 after promotion, 57 min), pinjol at the end 0 to 1%.

## Not changed
- Judol and Viral. The hint path sits at Viral 85 to 87 through the Kelurahan and the Kecamatan, and three in four households end on judol. With food in place they no longer borrow, but judol still takes 30% of their shop income. Whether Viral that high should be normal is a separate call, for a TODO item in the next sweep.
- The goal's done-when reads "10 of 10 hint-path seeds in the Nightly". Four seeds ran here; the Nightly confirms the other six.

Verdict: self-approved under the TODO rule. GAME-DESIGN.md §2 (Perut) is updated. §8 row 18 (slowest over fastest) is unchanged, since star times barely move.
