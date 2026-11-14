# T2: item 12 path unlocks and the SK; item 13 Orang Dalam from B2

Item 12 now folds the Kelurahan path buildings into each star's unlocks and counts a 3★ with a next stage as a new system; item 13 judges Orang Dalam from B2 and names `decisions/scorecard-design-calls-T5.md` in the evidence. Harness tests cover both item 12 rules, `GAME-DESIGN.md` §8 item 13 Pass records the B2 rule, and `npm run typecheck` and `npx vitest run tests/scorecard/harness.test.ts` pass (13 tests). Star kind counts from the scorecard readers, read on builder seeds 1 to 3 (600 ticks, stop at 9 stars):

| Star | Before | After |
| --- | --- | --- |
| RT 1★ | 4 (building, decor, reward, system) | 4 |
| RT 2★ | 2 (building, decor) | 2 |
| RT 3★ | 3 (building, decor, system) | 3 |
| RW 1★ | 2 (building, system) | 2 |
| RW 2★ | 2 (building, system) | 2 |
| RW 3★ | 0 | 1 (system) |
| Kel 1★ | 2 (building, system) | 2 |
| Kel 2★ | 0 | 1 (building) |
| Kel 3★ | 0 | 1 (system) |
| Kec 1★ | 1 (building) | 1 |
| Kec 2★ | 0 | 0 |
| Kec 3★ | 0 | 0 |

Longest run without a new system: 5 stars before, 3 after. Item 12 still reads Fail on thin stars (RW 3★, Kel 2★, Kel 3★, Kec 1★ to 3★) and the Kec system run; item 13 still reads Fail on Orang Dalam B3/B4 never spent and Stempel B4 never earned. Those are measurements, not changes in this task.
