# Simpler main screen

- Removed the rail, the quick tabs and the SYSTEM button (`src/ui/console.ts`, `console.css`). The title bar is a slim name-and-date strip.
- Satellite view at 88x60. Compact bottom row, still 48px controls.
- E2E: the main-screen button list is back to chips, pause, speed and Menu. The frame test checks there is no rail, tab row or SYSTEM button, a full-width map, a compact bottom row, a small satellite view that pans, and both themes. A new test opens every former shortcut's panel from the Menu. The path test no longer pans round a rail.
- Screenshot baselines redrawn in CI for the HUD and the screens that show it.
- Status row (`#status`): the goal on one line with tap-to-expand Next ★ (`src/ui/goal.ts`), beside a compact Emas meter.
- Notices are a 3s toast over the map (`App.toast`, `#ticker.notice-toast`). The home screen shows the Welcome toast when play starts.
- E2E: the goal expands on tap; a toast shows inside the map, fades, and stays in the Log; Light and Dark main-screen boxes match exactly.
- ART.md has a new UI chrome section. GAME-DESIGN.md section 6, UI.md rule 2 and CONTRIBUTING.md describe the status row and the toast.
- Baselines redrawn in CI's Playwright image by the Update baselines workflow (commit 2fca619): HUD, Build sheet, event popup and tip card changed with the new layout. The home baseline hides the map, so it barely moved. Before and after images are linked in the PR.
