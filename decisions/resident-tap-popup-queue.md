# Resident tap wins, popups wait for sheets

- A walker wins over the tile under them. Tapping a resident on a path opens their sheet, not the path's.
- Hit test is screen-first, then ground tile, so a tap on the sprite or where they stand both work.
- The sprite hit box is at least 48px, centred on the sprite, matching the UI tap-target rule.
- Only the first 10 residents have walkers, so the Warga list still covers the rest.
- A modal or event card queued while a sheet is open waits for the sheet to close.
- The frame loop shows the queued card on the next frame after close, so nothing is lost.
- Time was already held while a sheet was open, so deferring the card changes blocking, not time.
