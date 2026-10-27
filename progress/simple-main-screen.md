# Simpler main screen

- Removed the rail, the quick tabs and the SYSTEM button (`src/ui/console.ts`, `console.css`). The title bar is a slim name-and-date strip.
- Satellite view at 88x60. Compact bottom row, still 48px controls.
- E2E: the main-screen button list is back to chips, pause, speed and Menu. The frame test checks there is no rail, tab row or SYSTEM button, a full-width map, a compact bottom row, a small satellite view that pans, and both themes. A new test opens every former shortcut's panel from the Menu. The path test no longer pans round a rail.
- Screenshot baselines redrawn in CI for the HUD and the screens that show it.
