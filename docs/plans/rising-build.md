# A building that rises behind scaffolding, not a crane

Status: approved by Hari 2026-11-01 (TODO item "HIGH PRIORITY: Replace the construction crane", option 4B in project file `plans/neighbour-options.md`; "continue" on the ranked TODO).

## Goal
The crane (`crane` in `src/render/iso.ts`, drawn by `site('crane', false)` in `src/render/map.ts`) is 44 px tall on a 1x1 tile. It breaks UI.md rule 17 (map art stays in its footprint), floats over trees, covers badges and shows no progress.

## Decisions
- While `status === 'building'`, draw the full building art clipped from the ground up to its progress, then the scaffold on top, then the existing dust fx. Progress is `1 - b.timer / def(b.def).buildMonths`, clamped to 0..1.
- Permit keeps the staked plot. Mangkrak keeps grey plus scaffold and does not rise.
- The badge top (`tops`) for a building site reads the scaffold art, not the crane.
- The crane sprite is removed from `src/render/iso.ts`. It is engine-drawn, not one of the artist's sprites.

## Tasks

### T1. Rising build behind scaffolding (Sonnet, executor trial)
- Files: `src/render/map.ts`, `src/render/iso.ts`, `tests/e2e/ui.spec.ts`
- Exact changes:
  - In `drawOne` in `src/render/map.ts`, the `b.status === 'building'` branch: replace the 0.5-alpha full art and `site('crane', false)` with: `ctx.save()`, clip to a rectangle that covers the art's bottom `progress` share of its height (use the art's screen top from `artTop` and the tile's ground point), draw `art` at full alpha, `ctx.restore()`, then `site('scaffold')`, then the dust fx as now. Keep pushing the art's hit to `this.hits`.
  - In the `topArt` line, use `siteArt('scaffold')` for `building` as for `mangkrak`.
  - Delete the `crane` entry in `src/render/iso.ts` and the comment that names it in `map.ts`.
  - Add one e2e test in `tests/e2e/ui.spec.ts` next to "a building waiting for a permit shows its Orang Dalam button without scrolling": place a building, skip the permit, and assert the site still opens its panel on tap and no page error is thrown.
- Done when: `npm run typecheck` and `npm test` pass (including `tests/art.test.ts`); `git grep -n "crane" src` returns nothing; `npx playwright test tests/e2e/ui.spec.ts -g "permit|building site" --project=phone-320-id --project=phone-430-id` passes; `progress/rising-build.md` holds a 412 px screenshot of a site at about half progress; `decisions/rising-build.md` exists and says it replaces the crane part of `decisions/crane-phases.md`.
- Don't touch: permit and mangkrak drawing, the scaffold and patok sprites, the artist's sprites, sim code, visual baselines, TODO.md.
