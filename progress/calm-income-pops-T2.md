# Calm income pops: outline instead of the black box

- `src/render/map.ts`: the pop loop now draws the resource icon and a dark-outlined number, and no longer fills a black rounded box behind each pop. The number is stroked in `#0b0b0c` with a 4px round-joined line (2px on each side) before it is filled in `RES_COLOUR`, so it stays readable on grass and roofs while covering far less of the map. Why: the box was what turned many pops into a solid wall (Hari's Kecamatan screenshot, 2026-11-09). The collision nudge, `POP_MS`, `rise`, the font and the icon sprites are unchanged.

Review: diff read in full and matches the plan's exact changes. Nothing outside Files touched.
