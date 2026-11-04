# Scorecard: traits and combos linted (item 2), Dana, Stempel and Anggaran tracked (item 13)

TODO item "Finish the scorecard: the 10 Unknown rows and the bot gaps", first slice.

- **Item 2, data lint:** `lintTraitsCombos` in `tests/scorecard/scorecard.ts`. A trait is dead when it has no effect field (an `output` of 1 does not count) and `src/sim` never names it. A combo is dead when it has no effect and the sim never names it, or needs a building that does not exist (a `@3` suffix is a level). Retired combos are skipped. The row now gives a verdict: Pass, 10 traits and 27 combos. `harness.test.ts` runs the lint on every `npm test`, with a planted dead trait as its canary.
- **Item 13, sources and sinks:** the timeline row gains `dana` (builds funded and waiting across the AI-run RTs), `stempel` (stamps in hand) and `anggaran` (the year's Anggaran left after spending). Each is judged only in bands where it is ever above 0, since it exists only from the stage that brings it. The row stays Fail on real findings (Viral never earned in B3 and B4, Orang Dalam never spent in B1 and B4, Dana never spent in B3, Stempel never earned in B4); those belong to the balance item.

## The refreshed scorecard

The committed `scorecard/scorecard.md` was from 2026-11-01. This run (`npm run scorecard`, local) reads 3 Pass, 14 Fail, 10 Unknown. New since the last committed run, and outside this change:
- Item 23: the builder bot reaches RT 2★ late in 10 of 10 seeds and misses RT 3★ in 8.
- Item 1: a 192s wait with nothing affordable (was 0s).

Both likely follow the 2nd-RT tutorial (#306), where RT 3★ now needs the second RT and the bots do not build there yet. That area is claimed by voidinside99, so this is logged as a TODO item for the bots, not changed here.
