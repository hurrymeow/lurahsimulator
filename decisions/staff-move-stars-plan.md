# Staff move a star: the plan

TODO item "Hired staff must move the score or a star gate", which asked for a design call on the staff plan. Plan: `docs/plans/staff-move-stars.md`.

## The call
Make "programs carried out" (Realisasi landed in the stage) a star line at RW 3★ and Kel 2★ and 3★. From the RW on, Inem leads one program at a time at twice the delay, so how many programs run at once follows how many people the player has hired.

## Why this and not the others
- **A ranking rule:** ruled out by `decisions/stars-follow-play.md` (rival tracking at 0.9 to 1.35) and `decisions/wacana-staff-core-T6.md` (score weights, desk-queue multipliers up to 8x). Staff barely move the area score, so any rule tied to it sees two equal players.
- **Staff in the score:** adding staff levels to the area score changes nothing while bots win nearly every quarter by a wide margin.
- **A "hire N staff" line:** checks the box once and says nothing about play.
- **Programs carried out** is the game's own satire (Laporan against what is real): announcing is free, doing it takes people. It uses the `leading` rule and `realisasiDelay` that already exist, and needs no new screen.

## Risks the plan answers
- **Soft lock:** a player who never hires keeps Inem as a lead, one program at a time, so every line stays reachable. T1's test checks it.
- **Pacing:** the T2 bars hold Act 1 under 60 min and slowest over fastest at or under 1.3.

Self-approved under the TODO rule (2026-11-02): GAME-DESIGN.md §8 items 4, 10 and 18, and the T6 bar 5 it was raised for. GAME-DESIGN.md changes in T3, with the numbers.
