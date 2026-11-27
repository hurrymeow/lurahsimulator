# Road access is easy to read while placing

TODO item "Road access is hard to read while placing" (agent playtest 2026-11-25, #484).

## What was wrong
- **Nothing glowed before the first tap.** The bar said "Ketuk petak kosong yang menyala" (tap a glowing empty tile), but the renderer drew the free-spot tint only once a ghost existed (`this.valid && this.ghost && ...`). The "very faint" tiles the playtest saw were the ones that appeared after a tap.
- **Road-fed spots looked the same as idle ones.** Every spot a building could stand on got one pale cream diamond (26% fill). A building with no connected road beside it may be placed, but it sits idle ("Belum ada jalan di samping petak ini"). A tile inside the road loop that touches the road only at a corner looks road-side in the isometric view, but is not.
- **The warning pointed nowhere.**

## What changed
- **The spots glow as soon as a building is in hand,** before the first tap.
- **Two tints.** Spots beside a road that reaches the Kantor (`hasRoadBeside` on `connectedRoad`, the same test the warning uses) get a strong light tint and a 2px white outline. The other spots keep the faint cream one, so a building put there will sit idle. Buildings that need no road (flat pieces, decor, stage buildings) get the plain tint only.
- **A pointer.** With the ghost on a spot no road reaches, the nearest road-fed spot gets a pulsing green outline (steady when effects are off, UI.md rule 11), next to the warning in the bar.
- `needsRoadFor` in `src/app.ts` is now the one place that says which buildings need a road (`bestSpot`, the warning, the tint).

## Checks
- **e2e:** a new test checks, on a new game with a Warung in hand, that road-fed spots are marked and that a spot with no road points to a road-fed one, with the warning shown, and that the overlays clear when placing stops.
- 106 e2e tests (placing, build, coach, tutorial, road, walkers) pass at 320 id and 412 en. `npm run typecheck` and `npm test` pass.
- **Screenshots at 412 id,** checked by eye: before the first tap the road-side spots stand out in white from the faint ones and from the grass; with the ghost on an idle spot, the green outline shows on the nearest road-side spot.

## Verdict
Self-approved under the TODO rule. Done-when met: on a new game at 412px the valid tiles can be told apart in a screenshot, and a refused tile points to a valid one.
