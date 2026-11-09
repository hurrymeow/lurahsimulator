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

## T1 trigger, second change (2026-11-09)
Affordability alone hired two Asisten at RT 1★ (Rp 450k + Rp 300k a week); wages beat early income, kas went negative by t=24 and no hire survived to t=400 (PR #386). Chosen: hire only with fewer than 2 Asisten on staff and 12 weeks of the new wage bill in kas on top of the lowongan cost and buffer. If seed 3 still fails, relax the test to at least 1 Asisten and log "Asisten wages too steep before RW" for T6, with no third rework.
