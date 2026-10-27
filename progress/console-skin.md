# Console look

- Settings > Console look (`console` setting, off by default) adds the `skin-console` class.
- `src/ui/console.ts` builds the title bar, the rail (Build, Wacana), the satellite view that pans the map, and the quick tabs (Log, Kas, Warga, Wacana). `src/ui/console.css` restyles the main screen in cream and ink.
- `MapView.drawWorld()` is public so the satellite view can shrink the world art.
- New strings in English and Indonesian. An e2e test covers the default, the switch, every control, the satellite pan, the reload, and a legibility scan at 320, 360 and 390px. The settings test now counts 6 switches.
- DESIGN.md and CONTRIBUTING.md describe the option.
