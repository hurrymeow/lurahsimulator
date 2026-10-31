# Combo book moves into the Build sheet

The maintainer asked for the Combo book to sit in the same sheet as Build.

- Combo is now the last tab of the Build sheet, after Housing, Shops, Facilities and Decor. It left the Menu, so no panel appears in two places (UI.md rule 2).
- Why: combos are made by placing buildings side by side, so the list of what to build next belongs beside the buildings. It is still 2 taps away (Build, Combo).
- Build does not remember Combo as its last tab. The next Build opens on the last building tab, so placing a building never costs an extra tap.
- Below 412px the five tabs sit three and two, so Combo never ends up alone on a full-width row that looks like a primary button.
- The Combo filter buttons now fit on one row at 320px (min width 48px instead of 64px).
- The tutorial now says "Build, Combo" ("Bangun, Combo") instead of "Menu, Combo".

Docs updated: UI.md rule 2 and GAME-DESIGN.md (UI rules and touch and layout).
