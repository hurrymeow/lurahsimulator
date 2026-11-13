# Stars follow time: the rival chase does not separate play, and staff cannot until they move the score

TODO item "Stars still follow time in the stage, not how well the player plays". Plan: `docs/plans/stars-follow-play.md`. Verdict: T1 merged (#417) as a safety net; the done-when is not met by any ranking rule; reason below.

## What was tried
`RIVAL_TRACK` makes the rival score at least that share of the player's score the quarter before, from the RW on. Builder with hiring against builder with `hire: false`, seeds 1 to 4, star ticks at main 7a7ddf6 (road rule on):

| RIVAL_TRACK | Hiring builder | No-hire builder |
| --- | --- | --- |
| off, 0.9, 1.0 | RW 2★ 253 to 263, RW 3★ 265 to 286, Kel 3★ 444 to 480 | RW 2★ 259 to 263, RW 3★ 267 to 280, Kel 3★ 444 to 468 |
| 1.1 | stops at RW 1★ on all 4 seeds | stops at RW 1★ on 2 seeds, RW 2★ on 2 |
| 1.2 and 1.35 | stops at RW 1★ | stops at RW 1★ |

- Results at 0, 0.9 and 1.0 are identical to the tick. The player grows every quarter, so a rival that only follows the player's last score never wins a quarter.
- At 1.1 the bots stall: their score grows in jumps, and a flat quarter loses. Nothing separates hiring from no-hire, because both stall on the same wall.
- The no-hire builder is within 0 to 9 ticks of the hiring one at every star (up to 3%), against the 15% the TODO wants.

## Why no ranking rule fixes it
Hiring staff barely moves the area score (residents, buildings, combos, Popularitas, programs). Any ranking rule tied to that score sees two equal players. Wacana and Staf T6 saw the same (`decisions/wacana-staff-core-T6.md`, bar 5).

## What is left, as new TODO items
1. Staff must move score or a star-gate input: for example a hired Asisten adds programs, Sejahtera or permit speed that the ranking counts. Needs a design call, because it touches the staff plan.
2. RW 1★ still lands about a minute after promotion (RT 3★ 19.7, RW 1★ 20.8 min in the Nightly of 2026-11-13). Raising what it asks is a pacing change; do it with the next Nightly baseline.

## Not changed
`RIVAL_TRACK` stays at 0.9. It does not bite today and costs nothing. It stops a very strong stage from coasting if later changes make growth slower.

The Nightly of 2026-11-13 after #415 (road rule on) also moved every bot: builder RT 3★ 13.1 to 19.7 min, Kel 3★ 51.2 to 62.4 min. That belongs to the scorecard thread's refresh, not to this item.

Verdict: self-approved under the TODO rule.
