# T1 progress: strategy bots build the combo the strip names — stopped

Local `runBot(bot, seed, 200)` times, in minutes, on seeds 1/2/3. "After" is the literal exact change (a targeted `buildCombo(c, p.buffer, pick.ids)` before `buildFrom` for every `combo: 'book'` plan), since reverted.

| bot | RT 1★ before | RT 1★ after | RT 2★ before | RT 2★ after |
| --- | --- | --- | --- | --- |
| builder | 0.3 / 0.3 / 0.3 | 0.3 / 0.3 / 0.3 | 9.3 / 8.8 / 8.5 | 9.3 / 8.8 / 8.5 |
| shopkeeper | 7.3 / 4.7 / 4.7 | 8.0 / 8.8 / 7.9 | 9.7 / 10.4 / 11.5 | 10.4 / 13.1 / 11.5 |
| safety | 0.3 / 0.3 / 0.3 | 0.3 / 0.3 / 0.3 | 6.0 / 7.5 / 8.4 | 6.0 / 7.5 / 8.4 |

The done-when (shopkeeper RT 1★ under 2.5 min) is not met. With the change, `npm run typecheck` passes but `npx vitest run tests/scorecard/harness.test.ts` fails ("a builder hires an Asisten once it can afford one": 1 Asisten). With `driver.ts` restored to main, both pass. The cause: `shopsFirst` takes all three road-fed lots within range of Kantor RT at week 0, before the strip names Rapat Malam at tick 4; the missing Pos Ronda can then only stand out of range, and the book's move branch requires 8 copies. See `decisions/scorecard-design-calls-T1.md`.
