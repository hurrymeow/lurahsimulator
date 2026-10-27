# Bigger map

- `src/ui/console.ts` builds only the rail now. The title bar, the satellite view and the quick tabs are gone, with their CSS and the `cs.*` strings in both languages.
- The 640px-tall special case in `console.css` is removed, because every phone now gets that layout.
- E2E: the frame test checks the title bar, satellite view and tabs are gone (not in the page), the slim-HUD test expects only the chips, the rail, pause, speed and Menu, and the satellite nudge in the tall-building test is dropped.
