# Scorecard harness

Shipped: the timeline recorder, nine bots and `npm run scorecard`, which writes the GAME-DESIGN.md section 8 scorecard.

- `tests/scorecard/driver.ts`: the bots (idle, builder, shopkeeper, safety-first, cheapskate, Pencitraan, honest, random placer, hint reader) and `runBot`, which logs one row per tick and one event per thing that happens.
- `tests/scorecard/scorecard.ts`: turns timelines into 27 rows. Pass, Fail or Unknown, each with evidence.
- `tests/scorecard/takeover.ts`: the soft-lock check. A builder bot takes over an idle, random or cheapskate game mid-state and must still earn a star or finish a goal line.
- `npm run scorecard` runs 10 seeds per bot, split over parallel workers, and writes `scorecard/scorecard.md` and `scorecard/golden-trend.json`.
- `.github/workflows/nightly.yml`: runs the same, shows the table in the run summary and uploads both files.
- `tests/scorecard/harness.test.ts` runs in `npm test`: every bot plays, timelines are deterministic, takeover works.
