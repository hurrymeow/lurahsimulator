# Bigger map: no title bar, quick tabs or satellite view

- The person asked for the earlier layout with a bigger map and for the mini map (the satellite view) to go. The title bar and the quick-tab row took about 104px of height on every phone, and the satellite view floated over the map's top-right corner.
- All three are removed on every screen, not just short phones. Only the rail stays beside the map. This is the layout short phones (640px tall or less) already had, so the 640px special case is gone too.
- The date is back in the bottom row. Settings, Log, Kas, Warga and Wacana stay in the Menu, so nothing is lost.
- Updates the docs per AGENTS.md (choice 2): GAME-DESIGN.md section 6, UI.md rule 2 and CONTRIBUTING.md.
- The `cs.*` strings for the removed controls are deleted in English and Indonesian. `MapView.drawWorld()` stays public, since it is harmless.
