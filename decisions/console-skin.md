# Console look as an optional skin

- The cream train-and-city-builder UI from `mockup.html` goes into the game as **Console look**, a Settings switch that is off by default. The dark HUD stays the default and DESIGN.md's main-screen rules still describe it.
- The skin is a frame, not a new set of panels. SYSTEM, the rail and the tabs only open panels the Menu already has, and the Menu button stays. So a panel never lives only in the frame, and the default look loses nothing.
- Only the main screen changes. Sheets and modals keep the default dark look, so their many hard-coded colours keep their tested contrast.
- Resource colours switch to ink-dark tones on cream, so the numbers pass the contrast scan.
- Text stays 16px and controls 48px. The mockup's 12 to 14px captions became one-word 16px captions.
- On phones 640px tall or less, the title bar and the tab captions drop out, because the map shrank under 200px at 320x568.
- The build palette from the mockup is not ported. Build already opens as a sheet from the rail.
