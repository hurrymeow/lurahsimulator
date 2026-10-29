# Inspection variants

- `src/data/events.ts`: three new inspection events, `INSPECTIONS` criteria sets, `HEALTH_POSTS`.
- `src/sim/inspection.ts`: `criterion()`, score `parts`, theme chosen at the warning (`inspection.theme`, `inspection.last`).
- i18n: criterion names, per-theme "passed on shortcuts" lines, ID event text.
- Tests: themes rotate and score their own criteria, new criteria, each has a free choice; e2e event legibility covers the new ones.
- GAME-DESIGN.md: an Inspections entry.
