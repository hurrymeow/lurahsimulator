# T7: B0 novelty bar is two ticks

Task T7 of `docs/plans/scorecard-design-calls.md`. The sim moves in 8s ticks, so a 10s B0 novelty bar fails any 2-tick gap (16s) and no run could ever pass it. `GAME-DESIGN.md` section 8 and `NOVELTY_MAX_S` in `tests/scorecard/scorecard.ts` now set the B0 bar to 16s, the smallest gap the tick grid can measure. Item 11 content depth stays Fail: content still ends at the Kecamatan, and that is fixed by Act 2 and 3 content, not by this bar.
