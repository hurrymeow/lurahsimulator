# Combo join highlight

## Goal
When the building in hand is a missing piece of a combo, the map marks the free tiles where it would sit close enough to its partner to form the combo (Hari, 2026-11-09, "go for the reco"). Evidence: the screen-only bot owned Kantor RT and four Pos Ronda and never formed Rapat Malam, because the screen says "place side by side" and not where (`decisions/playtest-bot-gaps.md`). No new text. No number changes.

## Decisions
1. Valid tiles already glow (`markValid` in `src/app.ts`, drawn in `src/render/map.ts`). Join tiles get a second, gold tint on top, only while a partner stands.
2. A partner counts when it is a live combo's missing piece for the building in hand and is owned in any status (permit, building or active), so the player can see the spot while the partner builds.
3. Nearness uses `withinEdges` with the combo's `radius`, same as the combo check.

## Tasks

### T1. Join tiles in the sim (Sonnet, executor trial)
- Files: `src/sim/combos.ts`, `tests/combo-join.test.ts`
- Exact changes: add `export function comboJoinTiles(s: GameState, id: string, tiles: { x: number; y: number }[]): Set<number>` to `src/sim/combos.ts`. It returns the set of `y * GRID_W + x` for each given tile where a one-tile footprint of building `id` would be `withinEdges` (from `./state`) of an owned building (any status) that is another need of a combo from `liveCombos(s)` whose `needs` include `id` (compare with `parseNeed` and `baseDef`; ignore level requirements). Import `GRID_W` from `./types`. Add `tests/combo-join.test.ts` with three tests on `newGame(1)`: with a `kantorRT` placed at (5,5) via `addBuilding(..., 'permit')`, tile (6,5) is in the set for `posRonda` and tile (12,12) is not; with no partner the set is empty; a `rumah` never gets tiles for `posRonda` unless a combo needs it.
- Done when: `npm run typecheck` and `npx vitest run tests/combo-join.test.ts` pass. Delete any scratch file.
- Don't touch: other files, strings, saves.

### T2. Draw the join tiles (Sonnet, executor trial)
- Files: `src/app.ts`, `src/render/map.ts`
- Exact changes: in `src/render/map.ts` add `join: Set<number> | null = null;` next to `valid`. In the valid-spot drawing block (`if (this.valid && this.ghost && !this.ghost.tiles)`), after the faint diamonds, draw the same diamonds for each tile in `this.join` that is also valid, with fill `rgba(250, 204, 21, 0.38)` and stroke `rgba(250, 204, 21, 0.8)`. In `src/app.ts` at the end of `markValid`, set `this.view.join = comboJoinTiles(this.s, id, <the valid tiles as {x,y}>)` (import from `./sim/combos`), and set `this.view.join = null` where `this.view.valid = null` is set (line ~995). No string, no sprite.
- Done when: `npm run typecheck` and `npm test` pass; `npx playwright test tests/e2e/ui.spec.ts --project=phone-412-id` passes.
- Don't touch: other files, `UI.md`, strings.

### T3. Screen bot uses the tint? (not built)
Out of scope: the bot reads text and the canvas by tapping. Reading the tint from a screenshot is a later call.

## Kecamatan hunger (Hari: fold into tuning)
Not an executor task. It joins `docs/plans/wacana-staff-core.md` T6 (Sonnet thread, after the next Nightly). Input for T6: `decisions/playtest-bot-gaps.md` finding 2 (154 households, food for 50 at promotion, pinjol 55 to 71%).
