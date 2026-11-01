# CI scans for UI rules 13 and 14 (T5 of docs/plans/ui-hierarchy.md)

- New e2e `density and hierarchy` in `tests/e2e/ui.spec.ts`, with a counting helper in `tests/e2e/density.ts`. It runs on the 8 CI projects.
- It counts words in view, longest block, words per sheet and visible `.btn-primary` buttons on the home, choose and setup screens, Menu, every Menu panel, Build and its tabs, Warga, Wacana list and detail, and an event card with its result.
- Limits are 50, 20, 300 and 1. Screens still over are in `DENSITY_ALLOW` with caps at the highest count over all 8 widths and both languages on 2026-11-01: Build (four tabs), How to Play, Neighbours, Settings, Staff, Stats, and two primaries on events and Settings.
- A removed entry makes that screen fail at once, so the list only shrinks. Checked by deleting the Stats entry: "stats: wordsInView 83 > 50".
- Not covered: tutorial tip cards and toasts (rule 16 has its own check), and a staleness check for entries that pass.
