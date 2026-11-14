# Scorecard bot fixes T3: measurements

`moveOffRoad` rebuilds one off-road RT building beside a path per tick, and `buildCombo` clears one road-fed Sawah, Kebun Sayur or decoration near the anchor when the copy buy fails (see `decisions/scorecard-bot-fixes-T3.md`). Typecheck, `npx vitest run tests/scorecard/harness.test.ts` (12 passed) and the full `npm test` (699 passed, 11 skipped) pass.

Takeover seeds 1 to 5 (`takeover(seed, 'random', 100)`): seed 1 gained, seed 2 gained, seed 3 stuck, seed 4 gained, seed 5 stuck. The end states and the game finding for seeds 3 and 5 are in the decisions file.

Builder at 700 ticks, star minutes 1..6:
- seed 1: `0.3/8.5/9.9/10.9/22.4/28.8`
- seed 2: `0.3/7.6/10.8/11.7/21.3/25.6`
- seed 3: `0.3/8.5/10.1/11.1/21.6/27.2`

Against T2, only 5★ moved: seed 2 `20.1` to `21.3` (+1.2 min over the 1 min guard) and seed 3 `20.9` to `21.6` (+0.7 min). Every other star is unchanged.
