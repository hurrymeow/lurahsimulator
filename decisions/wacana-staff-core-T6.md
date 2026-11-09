# Wacana and Staf T6: tuning finds no lever (2026-11-09)

T6 of `docs/plans/wacana-staff-core.md`: read the bots after T1 to T5 against before, and tune only `SCORE.perWacana`, `perRealisasiLive`, `perRealisasiDone`, `PIC` and `PERMIT_STAGE_MULT`.

## How it was measured

The scorecard bots (`runBot`, 600 ticks, stop at 9 stars) on seeds 1 to 6, for `builder`, `pencitraan`, `honest`, `cheapskate`, and `builder` with `hire: false`. Two builds:
- **Before T2:** eacab98 (T1 merged, so the bots already hire; nothing counts programs yet).
- **Main:** a05c8d5 (T1 to T5 merged).
Ranking wins are the quarterly `s.ranking` entries won, summed over the 6 seeds. Star times are in weeks.

## Results

| Bot | Build | RT wins | RW wins | Kel wins | RW 3★ (weeks) | Kel 3★ (weeks) |
| --- | --- | --- | --- | --- | --- | --- |
| builder | before T2 | 48/48 | 48/56 | 84/85 | 204–216 | 372–396 |
| builder | main | 48/48 | 48/55 | 84/86 | 204–216 | 372–384 |
| builder, no hire | main | 48/48 | 48/55 | 84/88 | 204–216 | 372–396 |
| pencitraan | before T2 | 48/48 | 48/54 | 84/87 | 192–216 | 372–384 |
| pencitraan | main | 48/48 | 48/55 | 84/85 | 204–216 | 372–384 |
| honest | before T2 | 47/47 | 48/56 | 84/88 | 204–216 | 372–396 |
| honest | main | 47/47 | 48/50 | 84/86 | 192–204 | 360–372 |
| cheapskate | before T2 | 95/95 | 7/205 | — | — | — |
| cheapskate | main | 95/95 | 10/205 | — | — | — |

The win counts stop when a stage ends, which is why the totals differ while the wins match.

Stronger desk queues, on main with `PERMIT_STAGE_MULT` raised:

| Multiplier (RW, Kel, Kec) | builder Kel 3★ | no-hire Kel 3★ | no-hire RW 3★ |
| --- | --- | --- | --- |
| 1.5, 2, 2.5 (main) | 372–384 | 372–396 | 204–216 |
| 3, 4, 5 | 372–384 | 372–396 | 204–216 |
| 5, 7, 8 | 372–396 | 372–396 | 204–216 |

At the end of each run the programs part of `scoreParts` was 1 to 5 points, against a total of about 3,700 to 4,300.

## The bars

1. **`pencitraan` wins no more rankings than `builder`.** Pass: same counts.
2. **`honest` wins at least as many as before T2.** Pass: same wins, and RW 3★ and Kel 3★ now land a quarter sooner.
3. **The hiring bots stay inside their GAME-DESIGN.md §3 bands.** Unchanged by T1 to T5: builder RT 2★ (weeks 49 to 51) and RT 3★ (weeks 96 to 105) land on the same week on both builds. Both builds sit past the §3 status line (3★ weeks 77 to 90), so this drift predates T1 to T5.
4. **`cheapskate` reaches RT 2★ and never soft-locks.** Pass: RT 2★ at weeks 87 to 95. It reaches the RW and then wins few RW rankings, on both builds.
5. **A builder with `hire: false` reaches RW 3★ and Kel 3★ at least 15% later.** **Fail**, and none of the listed constants can fix it.

## Why nothing was tuned

- **Every climbing bot wins almost every quarterly ranking.** Its score is far above the rival, so the programs part (6 points for a full wacana) cannot tip a ranking either way, and spam cannot carry one.
- **RW 3★ needs 8 RW tier wins and Kel 3★ needs 14 Kelurahan ones.** Those wins come one a quarter, so the calendar sets the star week for every bot. This is the cause already logged in `decisions/smaller-map-T9.md`.
- **A slower desk queue only delays buildings.** Even 5 to 8 times the permit time leaves the no-hire builder winning every quarter. It hits every star on the same quarter as the hiring builder.
- **What it would take.** Hiring can make a star 15% later only once stars stop waiting on the ranking calendar, or once a ranking is close enough for staff output to swing it. That is the "Stage lengths, and stars that wait on the yearly ranking" item in TODO.md.
- **No constant changes.** Raising `SCORE.per*` or `PERMIT_STAGE_MULT` would change nothing the bots can see. It would also tilt the balance before the stage-length work lands.

## Follow-ups

- Bar 5 is carried by the stage-length item: once its stars stop waiting on the ranking calendar, rerun the no-hire builder.
- A ranking preview line (open question in the plan) only helps once rankings are close.
- The cheapskate stalls at RW 1★ on both builds (10 of 205 RW rankings won). It is not locked, but this is worth a look under the scorecard Fails item.
