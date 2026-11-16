# Pak Camat's board, T3 and T4: the bots claim, and the bars

T3 and T4 of `docs/plans/camat-board.md`. Taken over by the daily sweep on 2026-11-16 (#458); T1 #408, T2 #412.

## What changed
- `tests/scorecard/driver.ts`: every bot but idle claims done board goals each turn (`claimBoardGoals`), as the Menu count tells a player. The hint reader also works open goals that one action closes (a Bimtek, the cheapest Decor, Dana to an AI RT), but only with spare money: from the RW on, once a month, with the kas above 3 times its upgrade bar.
- The recorder counts a board goal done as a goal event, as GAME-DESIGN.md's band table now says ("a Pak Camat board goal done").
- GAME-DESIGN.md: the board under Staff, next to Inem's gigs. The density e2e already opens every Menu tile, so the board sheet is in it since T2; nothing to add.
- `tests/board.test.ts`: a playing bot leaves no done goal unclaimed; the idle bot claims none.

## The bars (nine player types, seeds 1 to 6, main 9352193 against this branch)

| Bar | Result |
| --- | --- |
| Star times move by no more than a quarter for any type | **Median: pass.** Builder, honest, Pencitraan and shopkeeper within 0.6 min at every star; hint within a quarter on every seed after the spare-money rule (Kel 3★ the same or 12 weeks sooner); safety's median Kel 3★ +1.6 min (one quarter). **Single seeds:** safety moves up to 4 quarters on seeds 4 and 5, both ways for the builder (seed 5 sooner): the extra kas from rewards changes what a bot buys next, and the run diverges. No type loses a seed at Kel 3★ except the cheapskate (1 of 6 to 0 of 6), which never hires and is already the slowest. |
| Longest goal gap falls at the RW and Kelurahan (§8 row 7) | **Pass.** Median longest gap, RW: builder 10.0 → 5.8 min, hint 11.7 → 3.6, honest 13.5 → 6.3, safety 12.9 → 5.9, shopkeeper 11.2 → 8.9. Kelurahan: 7.3 to 8.9 → 3.1 to 6.0 for every climbing type. Part of this is the new goal kind being counted, which is what the band table now defines. |
| Builder spends at least 2 more Orang Inside per stage (§8 row 13) | **Fail.** End Orang Inside is the same (912 → 919): bots earn far more than they spend either way, so an Orang Inside reward changes nothing they do. Row 13 needs a spending sink, not a source. |
| Shopkeeper's cash at the end falls (§8 row 14) | **Fail.** It rises (3,883 → 4,816 jt), because the hire and Dana goals pay Rupiah. Row 14 needs a sink. |

## What follows
- The plan's third open question already named this: "Rupiah rewards stop mattering once cash piles up; swap for Orang Inside from the Kelurahan on". The numbers show both rewards pile up. A late-game sink is scorecard rows 13 and 14, on the scorecard thread's item "Fix the remaining scorecard Fails that have a clear cause".
- Not changed here: the rewards. Changing them would not fix rows 13 and 14, and the board already does what it was for (§8 rows 1 and 7).

Verdict: self-approved under the TODO rule. Two bars pass (star times on the median, goal gaps); two fail with a stated reason (Orang Inside and cash pile up regardless), handed to the scorecard item that owns rows 13 and 14.
