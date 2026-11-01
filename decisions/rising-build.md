# Rising build behind scaffolding

Plan: `docs/plans/rising-build.md`. This replaces the crane part of `decisions/crane-phases.md`.

- While a building is being built, its art is clipped from the ground up to its progress (`1 - timer / buildMonths`, clamped), with the scaffold on top and the dust effects as before.
- Why: the 44 px crane broke UI.md rule 17 (map art stays in its footprint), floated over trees, covered badges and showed no progress.
- The badge top for a building site reads the scaffold art. Permit keeps the staked plot. Mangkrak keeps grey plus scaffold and does not rise.
- The `crane` sprite is removed. It was engine-drawn, not one of the artist's sprites.
