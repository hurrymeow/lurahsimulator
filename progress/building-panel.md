# Building panel redo

- `src/ui/inspect.ts`: the description is built from the current level; the level strip, "Level x/y" and the max-level messages are gone; the upgrade button reads "Naikkan ke Lv n · cost" with a "now → next" line, and is hidden at the top level; status shows only when a building is not working; disabled reasons are one grey line (`reasonLine`, used by every `actionButton`).
- `src/ui/levelBadge.ts`: the pixel roof badge (normal, upgrade affordable, top level with MAKS), drawn in palette colours.
- `src/sim/state.ts`: `occupants` (oldest houses fill first) and `homelessWithout`; `src/sim/rules.ts` puts the count in the Bongkar reason.
- Strings in `en.ts`, `id.ts`, `id-data.ts` and `data/buildings.ts`: new `insp.*` keys, the Bongkar line, "menarik" in the Rumah blurb.
- `ART.md`: the inspector line describes the badge.
- Tests: `tests/house-levels.test.ts` covers occupancy and the Bongkar count; `tests/e2e/ui.spec.ts` checks the badge states, the diff, the hidden button at the top level and the grey reason.
- Details and where it differs from the handoff: `decisions/building-panel.md`.
