# Pixel font: lowercase f

- Pixelify Sans draws a lowercase f as a capital F with a tiny shelf. "Efek" read as "EFek", "Fasilitas" as "A". Rewording single titles would miss the next one.
- Fix at the root: `scripts/patch-pixel-font.py` redraws f (crossbar through the stem, chamfered hook) and drops the f ligatures. It writes `src/fonts/pak-pixel-{400,700}.woff2`.
- Renamed Pak Pixel, since the OFL asks modified fonts to change name. Used for titles and primary buttons only, as before.
