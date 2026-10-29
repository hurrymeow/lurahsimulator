# Player-run neighbour RTs

Julian, 2026-10-29. Covers the high-priority TODO item "Let the player run an adjacent RT, or leave it to the AI and just fund it".

## Picks (Julian)
- **Build it now**, alongside the funding levers (#145), so players who want control have a real alternative to funding.
- **Cost: 3 Orang Dalam**, and the RT keeps its buildings. Its buildings and warga become the player's. Banked Dana is refunded, so nothing paid for is lost.
- **Hand back any time**, for free. Taking it again costs Orang Dalam again.
- Only RTs in the player's own RW (the 3 at RW, and the same 3 at Kelurahan). The other RWs belong to other Pak RWs.

## How it works
- `Neighbour.run = 'player'`. The cell's lots read as `rt` in `lotAt`, through a player-cells set in `src/sim/area.ts`. It is synced on load, promotion, takeover and hand-back, so Build, roads, walkers and placement rules treat it as the player's land with no other change.
- Stars: `viewOf` gives a player-run RT a view of the player's buildings in its cell, the player's Sabar, and a share of the player's residents in proportion to the cell's beds. Residents have no home tile, so the share is the honest stand-in. The checklist is unchanged.
- The area score skips a player-run RT, because its buildings already count in the player's score.
- After a takeover, free paths link any AI building that a path does not reach (`layRoads`), so nothing switches off for want of a road.
- Hand-back finishes unfinished buildings in the cell rather than losing them. The AI has no build timers. It is a small gift, accepted for simplicity.
- Iuran: a player-run RT pays none as a neighbour. Its warga are now the player's residents and pay the normal way.
