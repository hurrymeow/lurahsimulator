# Small UI batch

- Pause: `showPausedBadge` includes a manual pause; the pill is at the bottom in pixel capitals; the world clock in `MapView.draw` (`pausedFor`).
- Inspector: permit skip first, with `insp.skipHelp`; the perMonth sign fix.
- Satellite fold: `#cs-sat-toggle`, `Settings.satMin`, `#stage.sat-min` styles.
- Combo pop-up: `comboPics` in lists.ts, `pics` on the combo notice, `Notice.head`.
- `shortGoal`: `starWaitsOnCombo`, `bestDraw`, `goal.short.draw`.
- `src/sim/warnings.ts`: the 2045 drop toast and the one-time Popularitas warning; per-system Popularitas attribution in `tick`.
- `withinEdges` shared by combos, Kanibal and decoration.
- Coach note fits the game column; the arrow is relative to the note.
- Tests: unit (warnings, edge range, shortGoal order and draw, pause pill); e2e (pause pill and frozen world, permit button in view, satellite fold and reload, combo pop-up sprites, desktop coach).
