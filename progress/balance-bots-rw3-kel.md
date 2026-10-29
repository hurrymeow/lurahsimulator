# Balance bots: RW 3★, Kelurahan 2★ and 3★

- `tests/rw-bot.test.ts`: an Auto-dana run reaches RW 3★ (4 of 5 seeds in 9 years).
- `tests/kel-bot.test.ts`: an Auto-dana run reaches Kelurahan 2★ (3 of 3) and 3★ (2 of 3) in 10 years.
- Tim Audit is a yearly scheduled event every March from Kelurahan 1★ (`src/data/higher/kelurahan.ts`).
- Fix: AI RT views use jobless stand-in residents (`src/sim/neighbourView.ts`), which fixes a crash with job combos.
