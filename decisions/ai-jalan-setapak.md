# AI RTs lay Jalan Setapak, and their warga walk

Julian, 2026-10-29. HIGH PRIORITY TODO item (Hari).

- The AI follows the player's rule: every building that needs a road gets a shortest path of `jalan` over free tiles in its own cell, to the tiles round its Kantor RT or an existing AI path. It never uses the seam road. That keeps each RT's network its own, so a takeover hands over a working network.
- Spot choice: the usual best spot first. If no path can reach it, the rest of the pool, then anywhere free (up to 40 tries). If the RT is boxed in, it builds anyway, so a full lot never stalls the stars.
- Paths are not "built" buildings: the build order (`WANTS` rotation), the house/shop alternation, the combo-mix pick and the Neighbours count all use `builtBy`, which leaves paths out.
- Old saves: `Neighbour.pathsLaid` is missing, so the first month links every existing building once. Hand-back clears the flag, so the AI re-links after the player's changes.
- Path bonus (`pathMult`): AI RTs have no income model (they pay iuran per warga), so there is nothing to apply it to. Not changed.
- Walkers: up to 3 per AI RT, 24 across the map, kind `none`, walking only that RT's own paths (a per-RT walk mask). They are not residents, so a tap on one does not open a resident sheet. The plan is cached until an AI RT changes. Kelurahan fps at 320 and 430 matched main locally.
