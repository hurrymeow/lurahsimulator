# Place on tap

- `startPlacing` marks the free tiles and pans if none is in view; `bestSpot()` replaces `suggestSpot` as a hint only (`src/app.ts`).
- New bar text `build.tapToPlace` (EN, ID); the unused `build.tapTile` is removed.
- e2e: no ghost on select, a tap places it, the ghost drags; tests that relied on the instant ghost now tap first.
