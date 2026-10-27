# Path decay, level art, terraced hills, icon plates

Shipped:

- Jalan Setapak decays: random cracks after year 1, cut road access, and spreading about 10% every 6 months of neglect. Fix a tile, a stretch, or call a favour with Orang Dalam. Code in `src/sim/decay.ts`, numbers in `PATH_DECAY`.
- Level art: eight core buildings have their own progression. The rest get an upgrade kit. The inspector shows a level strip.
- Terraced kebun teh and sawah terasering on the land near the mountains.
- Menu icons on A-Train-style cream plates with mini scenes.
- Tests: `tests/decay.test.ts`, level height and difference checks in `tests/art.test.ts`, and E2E for the cracked-path inspector, the level strip and the icon plates.
