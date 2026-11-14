# T15 and T2: shipped

- `tests/scorecard/driver.ts`: shopkeeper looks for a combo from week 0 (`comboFrom: 0`). Shopkeeper RT 1★ goes from 4.7 to 7.3 min to 0.5 min on seeds 1 to 3. Builder and safety times are unchanged.
- `tests/scorecard/measure-T15.test.ts`: local star-minute printout, `MEASURE=1 BOTS=shopkeeper SEEDS=1,2,3 npx vitest run tests/scorecard/measure-T15`.
- T2 needed no code change. See `decisions/scorecard-design-calls-T15-bots.md`.
