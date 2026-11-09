# Pos Satpam, Wifi Tower and Kolam Lele: level 1 smallest, higher levels more shape (2026-11-09)

Koko's review of the building sprites: level 1 of these three did not read as the simplest and smallest, and Kolam Lele was the same flat pond at every level. Asked for Kolam Pancing's small details as the reference.

- **Wifi Tower:** level 1 was busier than level 2 (guy wires, dish, router against a plain tall box). Level 1 is now a short pipe mast with one pair of panels, two guy wires and the router; level 2 is a see-through BTS lattice tower with three panels, a microwave dish, a cabinet and a fence. The blinking light in `map.ts` moved to the new tops.
- **Pos Satpam:** level 1 is a narrow plank booth with a stool and no pots (the yard's pots now come at level 2); level 2 gets a longer, raised portal arm and a bench.
- **Kolam Lele** (`src/render/farm-art.ts`): a round terpal pond, a framed terpal pond under a paranet, a raised concrete pond with a zinc roof. The lele swim at the water's height per level (`LELE_WATER`).

Updates the docs: ART.md, Building levels (this overrides `decisions/wifi-mast.md` on what level 1 carries; the guy wires and panels stay, so it still never reads as a hammer).
