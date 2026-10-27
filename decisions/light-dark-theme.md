# Docs catch up with the shipped scenery

- DESIGN.md and ART.md now describe the hills, the dithered haze, the twin volcanoes and the drifting cloud streaks that shipped in the rolling-hills PR.
- Dithering is allowed for distant scenery only (haze, hill edge, mountains, clouds). Sprites and near ground stay flat cel-shaded.

# Console frame for everyone, with a Light or Dark theme

- The console frame from the console-skin PR is now the main screen for every player, not an option. Settings > Theme picks Light (cream, the default) or Dark (Mono Dark) for it. The Console look switch is gone.
- Light is the default because it is the frame's own look. Dark keeps the old palette for players who prefer it, and for night play.
- The rail now sits beside the map, not over it, so it never hides a tile. The Place and Cancel buttons account for the offset.
- Numbers left the pixel font (the money chip read "SJt"). The title-bar date uses the body font too.
- Sheets and modals keep their dark look in both themes. Restyling them is a separate job with its own contrast checks.
- The browser theme-color follows the theme. The PWA icon and manifest stay Mono Dark.
