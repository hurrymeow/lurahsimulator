# Kelurahan residents goals: keep the numbers

Hari delegated the call (2026-11-06): use judgement against GAME-DESIGN.md.

## Finding
The goal counts every resident of the player's holding (`population`, `src/sim/stages.ts`). By the Kelurahan the holding includes the absorbed RW, so bots arrive with 150 to 200 against goals of 50, 120 and 200. The first two are met on arrival.

## Decision
Keep the count and the numbers. Change nothing in code.

## Why
- GAME-DESIGN.md Kelurahan 3★: "A bigger kampung expects more, so holding Popularitas while growing is the work of this stage." The growth is expected, and the residents goal is a floor. The work is the Popularitas goal beside it (50, 45, 35).
- 200 is tied to the big-kampung taper (past 200 expect half, `decisions/big-kampung-taper.md`). The Kecamatan's 250 and its crowd weights (`decisions/kecamatan-balance-1.md`, `-2.md`) were tuned against that ladder.
- To bite on arrival, a goal would have to sit above 200, which breaks both. Counting only the original RT would drop the count below the Kecamatan's 250 ladder and make the 50 and 120 goals unreachable for slow seeds.
- The first star's real hurdles are the serapan and RW 2 goals, which the bots do wait on (280 to 376 s after 1★).

## Counter-argument
A goal met on arrival gives the player nothing to aim at on that line. The star list still shows it as done at once, which is a small win, not a gap. A person's playtest (TODO, T9) can reopen this.

Verdict: self-approved under the TODO rule.
