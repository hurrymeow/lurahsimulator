# Gemini icons

Hari (2026-10-28): not happy with the icon visuals, so every icon was regenerated with Gemini.

- One 5x5 sheet on magenta. `scripts/gemini-icons.py` cuts it to 16x16 and snaps it to six inks: ink, white, grey, mustard, red, orange. The result is in `src/render/icon-art.ts`.
- HUD icons (coin, heart, key, flame, person) are now 16x16, up from 8x8.
- Menu and dock icons use the same art on a dark bevelled plate. The three map-sprite scenes (neighbours, policies, combo book) became plain icons, and the cream plate is gone. The 12x12 glyph set (`glyphs.ts`) is deleted.
- The app icon is a Gemini isometric house with two flags on near-black. It is full colour and outside the ART.md palette, like the earlier icon exception. The maskable version scales it to 74% so a circle crop keeps the house.
- `favicon.svg` became `favicon.png`. `scripts/gen-icons.mjs` and `npm run icons` are removed, because they would overwrite the new icons.
- The artist's sprites in the map are untouched.
