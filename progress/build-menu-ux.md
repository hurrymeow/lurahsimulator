# Build menu: owned count, NEW tag, ghost on select

- `src/ui/build.ts`: "N owned" line on every card, `newTag()` and `unseenBuildings()`; closing the sheet refreshes the dock.
- `src/ui/console.ts`: the dock's Build button carries the NEW tag while something unseen waits; its label lives in `.cs-dock-label`.
- `src/app.ts`: `suggestSpot()` places the ghost on select, `markValid()` marks free spots (again on each refresh), `moveGhost()` serves taps, drags and mouse hover, `onGhost()` decides drag-the-ghost vs pan.
- `src/render/map.ts`: free-spot overlay, breathing ghost with a red tint when blocked, `ghostArrow()`, `centreTile()`, `inView()`, `centreOn()`.
- `src/style.css`: the animated pixel NEW tag and the owned line.
- E2E: the Place-buttons test expects the ghost and Place at once; new tests for the ghost on select plus drag, and for the owned count and NEW tags on card, tab and dock.
