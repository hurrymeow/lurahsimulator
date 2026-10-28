# No tip over the home screen

A save with a tip due (seen: "Warga cari kerja sendiri.", the Warga-and-jobs tip) showed that tip card over the home screen at launch, before Start.

Cause: the tips refresher ran on every `app.refresh()`, and `App.idle` did not count the home screen. `setupConsole` refreshes at startup and the game loop refreshes while home is open, so a due tip fired behind nothing.

Fix:
- `App.idle` is false while `#home` is open, so no tip (and no resource card) shows over it.
- `setupTips` runs after `showHome`, so the startup refreshes before `#home` exists cannot fire one either.

The tip still shows on the first refresh after the player taps Start and continues. The first-launch How to Play is unchanged: it opens after New game.

Test: `home screen › no How to Play or tip card covers it on launch, fresh or with a save` in `tests/e2e/ui.spec.ts`. It fails without the fix.
