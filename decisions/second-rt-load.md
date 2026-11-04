# The 2nd RT: T4, Kelurahan load check

Plan: `docs/plans/second-rt.md`, task T4 and decision 5.

## Result, Kelurahan 0★ to 1★ against B4
Four bots (hint, builder, shopkeeper, Pencitraan), 10 seeds each, on main with T1 to T3, T5 and T6. 32 of the 40 runs reached the Kelurahan, and all 32 earned the star. Times are at 1x.

| Check | Limit | Before | With the new line |
| --- | --- | --- | --- |
| Longest wait for a new thing | 60 s | 24 s | 24 s |
| Time to the first star | 10 min | 392 to 400 s | 392 to 400 s |
| Longest wait between goal lines | 240 s | 288 to 336 s, over in 32 of 32 | 192 to 200 s, over in 0 of 32 |

## The fix: a 24-week Serapan line, not the fallback
Approved by voidinside99 on 2026-11-04. Kelurahan 1★ now asks for Serapan of 80% for 24 weeks and then for 48 weeks. `GAME-DESIGN.md` line 211 says so.

- **Cause:** the 48-week line takes a full game year, and nothing else finishes after the RW 2 line at 64 to 104 s. The line dates from #275, before the 2nd RT work.
- **Why not the fallback:** decision 5 would hold the first Anggaran until RW 2 is funded. Serapan counts as 100% until a budget arrives, so the 48 weeks would run anyway. This comes from reading `src/sim/kel.ts`; I did not run it.
- **Why not 36 weeks:** it just passes at about 232 s, but the first star would come before the player sees December's Serapan rush.

## Teaching load
The first Anggaran arrives about 8 s after Got it on the AI RT arrival note, as money and a notice with no popup. The Dana note stays up. I did not check whether the notice text shows later, as another notice was on screen at that moment. Bots saw 7 to 9 popups in the window.

## On screen
The list hides finished lines. Until week 24 it shows two Serapan lines with the same count, which reads a little repetitive. It fits at 320 px in Indonesian, the longer language, with one Serapan line after week 24. The line has no celebration of its own, so whether finishing it feels like progress is for Hari's playtest.

## Not fixed
- **Later Kelurahan stars still miss the goal limit.** In builder runs (9 of 10 seeds reached it), the wait is 280 to 376 s after 1★ and 312 s after 2★. T4 covers 0★ to 1★ only. The cause was not traced.
- **Residents goals do little.** Bots arrive with 150 to 200 residents, against goals of 50, 120 and 200. Line 211 says the 50 is for the player's own kampung, so the goal may count too many people. Not traced.
- **Scorecard item 7 stays Fail overall,** because it also counts the bands and stars above.

## Verdict
Self-approved under the TODO rule against GAME-DESIGN.md section 8, the UI.md review checklist and TESTING.md, for the Kelurahan's first star only.
