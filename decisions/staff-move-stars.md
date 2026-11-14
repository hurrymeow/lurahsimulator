# Staff move a star: programs carried out need people to lead them

TODO item "Hired staff must move the score or a star gate". Plan: `docs/plans/staff-move-stars.md` (#423). This PR is T1 and T2 together: a new star line alone would stall every bot that never ran a program.

## What changed
- **A star line for programs carried out.** Goal kind `realisasiDone` counts Realisasi landed in the current stage (`RealisasiState.stage`; older saves count as the RT). RW 3★ asks **3**, Kel 2★ **3**, Kel 3★ **7** (cumulative in the stage). The plan's first numbers were 2, 3 and 6; the hire bar below needed 3 and 7.
- **From the RW on, Inem leads one program at a time, at twice the delay** (`INEM_LEAD_SLOW`). At the RT she still leads any number, as before.
- **From the RW on, a lead stays on a program until it ends.** The plan left this open. It is needed: a program cannot be restarted while it runs (24 weeks for most), so if leads were freed on landing, the number of different programs, not staff, would set the pace, and hiring would barely matter (measured below). A lasting program (Biopori Massal) frees its lead when it lands.
- **No lead free:** the Realisasi row says "Nobody free to lead it. Hire someone." / "Tidak ada yang bisa memimpin. Rekrut staf." The goal's how-to line says each hire can lead one more at once.
- **Bots:** every scorecard bot starts the cheapest program a free lead can take whenever a programs line is open (`realisasiWhen`); the honest bot keeps its own habit too. The scripted RW, Kelurahan and Kecamatan routines (`runPrograms` in `tests/kel-bot-lib.ts`) do the same, and post a job and hire the best-Rajin applicant when no lead is free, as the how-to line says.

## Evidence
**The bar (T6 bar 5):** builder with hiring against the same plan with `hire: false`, seeds 1 to 4, star weeks.

| | RW 3★ | Kel 3★ |
| --- | --- | --- |
| Hiring builder, main and here | 192 to 216 | 360 to 384 |
| No-hire builder, main | 192 to 216 (same week) | 360 to 384 (same week) |
| No-hire, leads freed on landing, 2/3/6 programs | 209 to 220 (+2 to 11%) | 415 to 426 (+11 to 15%) |
| **No-hire, here (leads held, 3/3/7)** | **239 to 250 (+16 to 27%)** | **475 to 486 (+27 to 32%)** |

**Nine player types**, seeds 1 to 6, main (5fd5d1f) against this branch, median minutes at 1x:
- Every climbing type keeps every star within a minute of main: builder, hint, shopkeeper and Pencitraan unchanged; honest up to 0.8 min sooner (it already ran programs); safety up to 0.8 min later. Every climbing type reaches Kel 3★ on as many seeds as on main.
- The cheapskate, which never hires, is later: RW 3★ 38.4 to 43.9 min, Kel 3★ on 1 of 6 seeds (was 2). Idle and random do not reach the RW lines.
- Act 1 stays under 60 min for the climbing types (Kel 3★ 49.6 to 57.6).

Scripted tests: RW bot (3★ within 9 years) passes; Kelurahan (3 tests) and Kecamatan bot (seeds 3 and 4) pass; the Kecamatan stars land on the same weeks after promotion as before (113, 250, 425).

## Not changed
- The Kecamatan stars: paced by districts, so they ask for no programs. Literasi Keuangan follows the new lead rule there (a hired lead lands it in 8 weeks, Inem in 16); `tests/pinjol.test.ts` now gives it a hired lead.
- The next step on the goal pill names no program yet; the how-to line says what to do. The hint bot climbs the same either way, since every bot works the line.

Verdict: self-approved under the TODO rule. GAME-DESIGN.md §2 (RW and Kelurahan star lines) and Staff (PIC) are updated. §8 items 4 and 10 and T6 bar 5: hiring now moves RW 3★ and Kel 3★ by 16 to 32%. §8 item 18 holds.
