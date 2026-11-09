# An icon, never a word (2026-11-09)

Julian's review of the Kelurahan and Kecamatan sprites after #383 and #392: "pixel font name is a bit hard to read and they look massive on the building, so in general lets focus on an iconic visual read without actual text unless theyre really simple (like RT, RW, etc with short names)". Also: Satpol PP and Pasar need a distinct icon (an animated blue and red siren; fruit and vegetables), RSUD a red cross bigger than the Apotek's, simple animations on higher-level buildings, Kantor Kelurahan level 1 looked exactly like the Terminal, and Kolam Lele level 1 needed a flat bottom to look grounded.

- **No words on the map.** PASAR, TERMINAL, SATPOL, POL PP and RSUD lettering is gone. A word cost 15 to 25px of wall at 32px a tile and the 3x5 font broke S and R when slanted. Short names such as RT and RW may still be lettered.
- **Pictograms face the street flat.** A slanted 5x5 pictogram smears; only a word plate keeps the wall's slant. This also changes Koko's emblem plates (star, tree, coin, gear) from slanted to flat.
- **New pictograms** (`EMBLEMS` in `sign-art.ts`, now any size): a basket of produce for the Pasar (banana, chili, orange, leaf, 7x5), a bus for the Terminal (7x5), a red cross for RSUD (7x7, on white with the hospital-green frame).
- **Pos Satpol PP** has no plate: a red and blue rotator bar on its roof is its sign, on the lookout from level 2.
- **Animations** (`Blink` on `Art`, `beacon` and `sirenBar` in `sign-art.ts`, `blinks` in `map.ts`): a sprite marks light points and colour cycles; the map steps them on the world clock, out of step per building, only on a working building at rest, and holds the first colour with reduce motion. Satpol rotator, RSUD ambulances (level 2 and up), Pasar lampu hias (level 3), the Terminal bus board's lamp (level 2). One native pixel per lamp, so a frame costs a handful of fillRects.
- **Kantor Kelurahan:** dark green roofs at every level (the Terminal and RW buildings are blue) and a level 1 teras of four white columns under a flat slab.
- **Kolam Lele level 1:** the tub's front curve is clipped flat across the middle with a line of packed soil under it, and the tub sits 1px higher so the soil stays inside the tile (`tests/footprint-art.test.ts`).
- Checked: `tests/art.test.ts` (height rules) and `tests/footprint-art.test.ts` pass; renders at 3x and 8x before and after, every level with silhouettes.

Updates the docs: ART.md, Building levels (the icon rule replaces the three plate styles; Kantor Kelurahan, Kolam Lele, the animated lights). This overrides the plate styles in `decisions/plate-styles-rsud.md` and `decisions/kel-kec-name-plates.md` where they letter a name.
