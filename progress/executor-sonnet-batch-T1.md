# T1: Wifi Tower needs no road

Added `roadless?: boolean` to `BuildingDef` in `src/sim/types.ts`, set `roadless: true` on the `wifi` building in `src/data/buildings.ts`, and taught `needsRoad` in `src/sim/access.ts` to return false for it. Added one test in `tests/access.test.ts` that keeps the road rule on and checks a Wifi Tower with no path beside it is not `noRoad` and works, while a `warung` in the same spot is `noRoad`; it fails without the `needsRoad` change. `npm run typecheck` and `npm test` pass.
