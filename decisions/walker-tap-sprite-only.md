# Walker taps hit the sprite only

Requested by Hari, 2026-11-03. Tapping a resident walking the map hits only their drawn sprite, head to feet. The rest of the ground diamond belongs to the Jalan Setapak or building on it.

- Before: the walker's hit box was padded to 48px (it spilled below their feet), and a tap anywhere on the tile they stood on also picked them (`Crowd.onTile`). A walker on a path covered the whole path tile, so the path could not be opened while someone stood on it.
- Now: the hit box is the same rectangle `draw()` paints. `Crowd.onTile` is gone.
- Supersedes the "at least 48px" and "sprite first, then ground tile" lines of `decisions/resident-tap-popup-queue.md`. UI.md rule 1 lists dock, sheet, pop-up, tip and home-screen controls; map sprites are not on it, so no doc changes. The Warga list still opens every resident with 48px rows.
- Matches `decisions/tap-base-tile.md`: the base tile under a tap picks the building, and sprites drawn over it no longer steal it.
