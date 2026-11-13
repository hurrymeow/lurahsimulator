# Staff move a star: programs carried out need people to lead them

TODO item "Hired staff must move the score or a star gate". Sources: `decisions/stars-follow-play.md`, `decisions/wacana-staff-core-T6.md` (bar 5).

## Goal
A builder that never hires should reach RW 3★ and Kel 3★ at least 15% later than one that hires. Today it is within 3%: every star past RW 1★ is gated by ranking wins, the bots win almost every quarter, and staff barely move the area score. No ranking rule can separate them (both decisions above tried). So the lever has to be a star line that staff pace directly.

## Decisions
1. **Programs carried out become a star line from the RW on.** New goal kind `realisasiDone` (Realisasi landed in this stage): RW 3★ **2**, Kel 2★ **3**, Kel 3★ **6**. It is the satire's own point: announcing is free, carrying out takes people. The goal line says so ("carry out 3 programs").
2. **From the RW on, Inem leads one program at a time, at twice the delay.** Today `picCandidates` always lets Inem lead, any number at once. From the RW she follows the `leading` rule hired staff already follow (one at a time), and her programs take twice as long to land. A player who never hires can still carry out every program, so nothing soft-locks; a player who hires runs several at once and faster. At the RT nothing changes.
3. **So throughput follows hiring.** A Realisasi holds its lead until it lands (1 to 8 weeks). With Inem alone, programs come one after another at double delay; with three hires, four at a time. The lead's Rajin already shortens the delay (`realisasiDelay`).
4. **No new screen.** The Wacana sheet's Realisasi rows already show who leads; a row with no free lead says "needs a free staff member to lead" (one new string in both languages). The goal pill's next step for `realisasiDone` names the cheapest Realisasi, or "hire someone to lead it" when nobody is free.

## Tasks

### T1. The goal kind and the lead rule (sim)
- Files: `src/sim/types.ts`, `src/sim/stages.ts`, `src/data/higher/stages.ts`, `src/sim/staff.ts`, `src/sim/realisasi.ts`, `src/i18n/en.ts`, `src/i18n/id.ts`, `tests/realisasi-goal.test.ts` (new), `decisions/staff-move-stars-T1.md`, `progress/staff-move-stars-T1.md`.
- `realisasiDone` counts Realisasi with `landsAt <= s.month` started in the current stage (record the stage on `RealisasiState`; old saves count as the RT). Goal texts and a how-to line in both languages. From the RW, `picCandidates(s, 'rajin')` applies the `leading` rule to Inem too, and `realisasiDelay` doubles when Inem leads; `checkRealisasi` refuses with the new string when no lead is free.
- Tests: the count is per stage; at the RW Inem leads one program at a time at twice the delay, and at the RT as many as before; a staff member who leads cannot lead a second until the first lands; a game with no hires still reaches RW 3★ in the RW bot test (no soft lock).

### T2. Next step and the bots
- Files: `src/sim/nextstep.ts`, `tests/scorecard/driver.ts`, `tests/nextstep.test.ts`, decisions and progress files.
- Next step for an open `realisasiDone` line: the cheapest Realisasi with a free lead, else "hire someone to lead it". Every bot that climbs (all but idle and cheapskate) starts a Realisasi when the line is open and a lead is free; the hint reader follows the step.
- Bars, nine player types on seeds 1 to 6 against main: the no-hire builder reaches RW 3★ and Kel 3★ at least 15% later than the hiring builder; every climbing type still reaches Kel 3★ on 6 of 6; slowest over fastest per star stays at or under 1.3 (§8 row 18); Act 1 stays inside B4 (under 60 min for the climbing types).

### T3. Docs
- GAME-DESIGN.md: the new star lines in §2 (RW, Kelurahan) and the lead rule under Staff. A decisions note with the T2 numbers.

## Open questions
- Whether Kec stars should also count programs (Literasi Keuangan is already one). Default: no, the Kecamatan is paced by its districts.
- Whether a program's lead should stay busy for its whole run (`lasts`), not only until it lands. That would make staff matter far more; start with "until it lands" and let the T2 numbers decide.
