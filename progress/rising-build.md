# Rising build

- `src/render/map.ts`: a site under construction draws the building clipped to its progress, then the scaffold, then the dust. The badge sits on the scaffold.
- `src/render/iso.ts`: the `crane` sprite is gone.
- `tests/e2e/ui.spec.ts`: "a building site under construction still opens its panel on tap" (building at half progress, tap opens the panel, no page error).
- Screenshot at 412 px of a Kosan at half progress: `progress/rising-build-412.png`.
- Details: `decisions/rising-build.md`.
