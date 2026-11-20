# Row 23: the forced worst-event chain

TODO item "Finish the scorecard: the forced worst-event chain". GAME-DESIGN.md §8 row 23, Pass bar: "Worst chain: next star within 2x target."

## What the chain is
- **Events:** Banjir, Cabai, Truk Sampah and Padam (`WORST_CHAIN` in `tests/scorecard/takeover.ts`), one a week, starting the week after a star lands.
- **Answers:** the builder answers each with the free choice. For these four that is the worst for Popularitas (−4, −4, −3, plus the flood's damage).
- **Why these four:** the RT event pool has no worse free choice. Banjir is the only one that breaks buildings.
- **When it runs:** after RT 1★ and after RW 1★, on seeds 1 to 5. That is 10 runs in the Nightly's `scorecard-takeover` job, written to `scorecard/.cache/chain.json`.
- **What it measures:** the weeks from the chain to the next star, against 2x its target. RT 2★: 2 x 37 = 74 weeks (§3 target 4). RW 2★: 2 x 52 = 104 weeks (the RW star gap).
- **Effect on the report:** it only adds the chain to row 23. With no `chain.json` it says so. No other row reads it.

## First reading (main at 219e45b, seeds 1 to 5)

| Seed | After RT 1★ (limit 74) | After RW 1★ (limit 104) |
| --- | --- | --- |
| 1 | 87 | 74 |
| 2 | 62 | 56 |
| 3 | 58 | 73 |
| 4 | 103 | 79 |
| 5 | 110 | 80 |

- **The RW recovers** on every seed.
- **The RT does not** on 3 of 5 seeds: RT 2★ comes 87 to 110 weeks after the chain, up to 2.97x its target. Without the chain the builder already takes 54 to 62 weeks, so RT 2★ is late in 6 of 6 seeds before any bad luck (row 23's other Fail).
- **Row 23 stays a Fail,** now for two measured causes. Both trace to a slow RT 1★ to 2★.

## Seen, not changed
- An RT kampung hit by four bad weeks right after 1★ loses up to 48 weeks against its next star. Which RT 2★ line lags after the chain is not traced yet. Whether to soften RT 2★ (a lower Popularitas line, or a cheaper fix choice) is a balance call that belongs with the RT 2★ pace note in the scorecard Fails item.

## Verdict
Self-approved under the TODO rule. Harness only: no game change. The item's done-when ("row 23 runs a forced worst-event chain") is met. `npm run typecheck`, `npm test` and a local report pass. The report shows row 23 with the chain.
