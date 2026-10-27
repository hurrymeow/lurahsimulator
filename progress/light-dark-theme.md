# Console frame for everyone, Light and Dark themes

- DESIGN.md and ART.md first caught up with the shipped hills, volcanoes, clouds and haze.
- The console frame is always on. `theme: 'light' | 'dark'` replaces the `console` setting; Settings has a Theme row with Light and Dark. `applySettings` sets `theme-dark` and the theme-color.
- `console.css` uses colour tokens per theme. The rail sits in the stage's left padding, beside the map. `positionPlace` adds the canvas offset.
- Numbers use the body font.
- E2E: the console test checks the frame by default, light and dark legibility, the rail beside the map, every control, the satellite pan and the theme surviving a reload. The settings test counts 5 switches again.
- DESIGN.md (layout and a new Themes section), CONTRIBUTING.md, UI-RUBRIC.md and ART.md describe the new layout and themes.
