# T1: shipped

- `tests/scorecard/scorecard.ts`: item 18's `gain` adds each outcome's `incomePct` (weighted by `weight / total`) to an `income` key and adds top-level `c.incomePct`; the `!c.incomePct` option filter is dropped. A Viral difference between two options makes the pair incomparable, so neither dominates; `viral` is left out of `geq` and `gt`.
- `tests/scorecard/harness.test.ts`: an option with a mean `sabar` gain and a 40% `incomePct: -0.05` outcome is not dominated by a flat `sabar: -1` decline, and vice versa.
- `tests/scorecard/measure-T1.test.ts`: local measure of the options item 18 flags.
- `GAME-DESIGN.md` §8 item 18 Evidence now says rolled outcomes count by their weighted mean with income swings included, and that a Viral difference is a trade.

Options item 18 now flags: none. The row reads Pass ("No strictly dominated option"), clearing all 9 options it flagged before.
