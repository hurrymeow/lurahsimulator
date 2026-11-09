# Make Wacana and Staf matter

2026-11-09, Hari. Playtest feedback from joofoot and kokoliem: staffing is rudimentary, you can finish without hiring anyone, and Wacana is rarely played.

- Hari picked "D + soft B, then C":
  - the quarterly ranking counts programs;
  - every program has a staff PIC;
  - permit folders grow with the stage;
  - a secondary goals board comes after a playtest.
- Hari: plan it and add it to TODO first, detailed enough for the DeepSeek executor. T1 to T5 are `(Sonnet, executor trial)`, and they pass `scripts/executor/preflight.mjs`.
- Also found: Sejahtera, the Kerja meter and Indonesia Emas change almost nothing. This is logged in TODO.md Later.
- Plan: `docs/plans/wacana-staff-core.md`.

## T1 trigger (2026-11-09)
The executor's first T1 run (PR #384) stopped: the builder bot on seed 3 never sees the desk hint, because it skips every permit with Orang Dalam and the queue peaks near 6 weeks against `hireAfter` 12. Chosen: the bot posts the Asisten lowongan on affordability (every 4th tick, no lowongan open, rupiah covers cost plus buffer) instead of waiting for the hint. Why: bot behaviour only, and T6 retunes timings from the Nightly scorecard anyway. Rejected: lowering the hint threshold in the bot (hides the real hint), changing the seed (same wall).
