# Residents use paths and buildings

- **Road rule:** a building works only when a chain of active Jalan Setapak (or aspal) tiles links a tile beside it to the Kantor RT. No path means `noRoad`: no income, no beds, no attract. Upkeep still bills, so the player feels it. Flat pieces (paths, ditches, parking, fields), Kantors and RW/Kelurahan seam buildings are exempt. Code: `src/sim/access.ts`, recomputed on place, demolish and twice a month.
- **No soft-lock:** new games start with two free path tiles under the Kantor linking it to both houses. A tip fires the first time a building has no road. Old saves get paths laid once (`roadsLaid`) from each cut-off building to the network.
- **Why not hide the building:** it stays on the map, greyed, with a "No road" badge and a line in the inspector. The placement bar warns before you place.
- **Perantau houses** spawn beside a road when one has a free spot.
- **Walkers** walk only on path tiles and seams. Their destinations are working buildings, at a path tile beside them. Ojol riders also use the ring road. Footprints: `ring()` already reads `footprint`, so 2x2 works once placement lands.
- **Speech bubbles:** on reaching a door a walker says a short line about the place (55% of visits, 2.6 s). EN and ID. Cosmetic: off with effects or reduce motion.
- **Tests:** the road rule is off in unit tests by default (`setRoadRule`), on in `tests/access.test.ts`.
