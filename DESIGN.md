# Design rules

Follow these every session. If a change breaks one, fix the change.

## Satire

- Satire targets systems and bureaucracy.
- No real politicians, parties, ormas or officials.
- No ethnic, regional or religious jokes.
- Every joke is a mechanic that moves a number. Flavour text alone gets cut.
- UI defaults to English, with Bahasa Indonesia as a Settings option. Players who saved a language keep it. Slang and proper names stay as they are in both languages (Sabar, Wacana, Warga, warung, ojol, Kampung Sebelah). Resource names are translated, see `decisions/resource-names.md`. Strings live in `src/i18n/`.

## Pacing

- Something new at least every 30s of real time at 1x: a resident, event, unlock or combo. Full targets in [PACING.md](PACING.md).
- Growth is visible on the map, not only in menus.
- Bad choices slow you down. They never soft-lock the game.
- Early-game safety net: no debt spiral in year 1.

## Clarity

- Unmet requirements always say exactly what is missing.
- Discovered combos are auto-logged in the in-game Buku Combo.
- Speed control: pause, 1x, 2x, 4x.
- Text advances on tap, never on a timer.

## Touch and layout

- Mobile-first, portrait, touch controls.
- Touch targets at least 48px, with 8px gaps.
- Primary actions in the bottom third.
- Main screen: a slim resource bar at the top, the map, and one bottom row: pause, speed, date, Menu.
- Every panel opens from the single Menu button, grouped as Kampung, Records and Game. Settings and How to play live under Game.
- New panels register an `ActionButton` with a `group` instead of adding a button to the main screen.
- Clean modern pixel UI. No cluttered Windows-XP-style panels.
- Map art follows [ART.md](ART.md): palette, ink, shading, lighting and motion rules.

## Art style

The artist's restyle is the reference ([ART.md](ART.md) has the full rules). New art must match it.

- Warm storybook palette: terracotta, mustard, teal, cream, olive. Keys live in `PALETTE`.
- 1px dark-brown ink (`#2a1810`) round every silhouette and face edge. Never pure black.
- Flat two-tone cel shading, light from the top left. No dithering or noise.
- Straight isometric lines on a 32x16 tile, scaled by whole numbers only.
- Flat ground art (selokan, jalan) sets `bare` and draws its own edges so neighbours join.
- Never overwrite the artist's sprites. Add new ones beside them.

## Feedback

- Combo or unlock gets fanfare. Routine income gets a small number pop.
- The game still feels OK with effects off.
- Ambient life (walkers, idle loops) follows reduce motion. Particles, coins, pulse and night tint follow effects.
- Canvas text (pops, badges) draws above the night tint.
- Haptics toggle in settings.

## Accessibility

- Every resource has an icon plus a colour. Colour never carries meaning alone.
- Text contrast 4.5:1, or 3:1 for large text and UI.
- Pixel font no smaller than 16px.

## Tech

- Vite + TypeScript + Canvas, no framework.
- Simulation logic is pure and separate from rendering, with unit tests.
- Buildings, combos, jobs and events live in data files under `src/data/`.
- Placeholder pixel sprites are generated in code. No third-party game assets or names.
- Save to localStorage inside try/catch. The game runs without storage.
- PWA ships an install button and an update banner. Icons and theme-color follow Mono Dark.

## Mono Dark

- Background `#0b0b0c`, surface `#18181b`, text `#f4f4f5`, muted `#a1a1aa`.
- UI chrome stays monochrome. Colour is reserved for game meaning (resources, map).
- Icons: exception to Mono Dark. Full-colour ART.md palette pixel glyph (house, sun, tree) on near-black. Hari lifted the monochrome rule for the icon only (2026-10-26). Theme-color stays `#0b0b0c`.

## Legibility and testing

- Body text uses Atkinson Hyperlegible. Pixelify Sans (patched as Pak Pixel by scripts/patch-pixel-font.py, so f is not a capital F) is for titles and primary buttons only. Pixelify draws 5 like S/8, so never use it for numbers.
- No ellipsis and no clipped text. Text wraps. Panels scroll.
- The map is isometric. Tile diamonds are at least 32px tall. Smaller screens pan the map instead of shrinking it.
- A tap on a building's body picks that building, even where it overlaps the tile behind.
- Disabled buttons stay readable: dashed border, muted text, no opacity fade.
- `npm run e2e` runs Playwright at 320, 360 and 390px wide. It scans every visible DOM text for clipping, ellipsis, font under 16px, contrast under 4.5:1, off-screen text and touch targets under 48px.
- Every new panel or message needs a scan in `tests/e2e/ui.spec.ts`. CI runs the suite on every PR.
