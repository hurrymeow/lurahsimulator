# HUD icon URL cache

- `iconURL` now caches each icon and scale. The HUD asks for the same icons on every refresh, and the 16x16 art made each uncached PNG encode four times bigger than the old 8x8 icons.
