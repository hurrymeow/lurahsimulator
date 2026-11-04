# Build on AI-run RTs, Kunjungan, and no more takeover

TODO item "HIGH PRIORITY: Let the player build on AI-run RTs, and add Kunjungan as a one-tap boost". Decided by Hari on 2026-11-01 (options 2E and 2B in the planning thread "Plan neighbour RT boosts and sheet"). This file is the plan and the record together.

## What changed
- **Build on AI RTs.** `siteGaps` lets RT-scope buildings stand on an AI-run RT's free lots (`aiLotAt`).
  - The AI's own buildings still block their tiles (`neighbourAt`).
  - Seams, and RW or Kelurahan buildings, are refused with "Another RT: only RT buildings go on its lots."
  - The buildings go into `s.buildings`, so they are the player's: built, upgraded and paid for from the player's kas, as takeover used to do.
- **They count for the RT.** `viewOf` reads the player's buildings in the cell along with the AI's, so they count toward its stars, combos, social Popularitas and beds.
- **The AI builds round them.** `takenTiles` and `freeTiles` now take the game state and leave the player's tiles alone. The AI's path-finder treats the player's paths as roads and the player's buildings as in the way.
- **Roads.** The AI's paths and its Kantor count as roads and a hub for access. A building the player puts deep in an AI cell can then reach a Kantor along the AI's own paths.
- **Kunjungan** (`visit`, `checkVisit`, `NEIGHBOUR.visitOd/visitWarga/visitEvery`):
  - It costs 1 Orang Dalam. The RT builds its next build now, with the usual Stempel letter from the player's RW, and 3 warga move in at once, up to its beds.
  - One per RT every 12 weeks. A refusal names the wait in weeks. Nothing is spent on a refusal.
- **Go to RT.** It is in each RT's detail. It closes the sheet and centres the map on the RT.
- **Takeover and hand-back are retired** from the sheet. The sim's `takeover` and `handBack` stay, because `absorb` (Kampung Sebelah at the Kelurahan) uses the same join code, and the tests cover them.
  - An RT taken over in an older save stays the player's. Its detail says so and offers Go to RT.
  - This needs no save migration, so no old save is lost.

## Not done here
- The Fallback the TODO item named (a per-RT build focus) was not needed. Go to RT makes panning to an RT one tap.
- The RW and Kelurahan bots do not use the new lever yet. They still reach their stars by funding, as `npm test` shows.

## Verdict (self-approved under the TODO approval rule)
- `tests/grow.test.ts` covers:
  - Placement rules: free lot yes; AI building, seam or RW building no.
  - A player building counts in the RT's view, and the AI never builds over it in 120 months of Auto-dana.
  - Kunjungan's cost, build, warga, quarter wait and Orang Dalam check.
- The e2e test "an AI RT takes a Kunjungan, Go to RT shows its lots, and the player can build there" places a Warung in the AI cell through the real Build flow. It passes at 320px ID and 412px EN.
- The density, centring and tab-set specs pass. `npm test` passes in full (598), including the RW and Kelurahan bots.
- GAME-DESIGN.md section 2 is updated to match Hari's decision.
