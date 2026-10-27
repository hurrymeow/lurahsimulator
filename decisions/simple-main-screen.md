# A simpler main screen: no shortcuts outside the Menu

- The person marked the Build / Wacana rail and the quick tabs (Log, Kas, Warga, Wacana) for removal, and asked for everything to live in the one Menu button, with no duplicates outside it. Both are gone. The title bar's SYSTEM button only opened Settings, which the Menu has, so it went too. The title bar is now a slim label strip: name and date.
- No feature is lost. Build, Wacana, Log, Treasury and ranking, Residents and Settings all open from the Menu, and an e2e test checks each one.
- The satellite view stays, scaled down from 128x88 to 88x60, without its rotated label. It keeps an aria label.
- The bottom row was scaled down by dropping its padding and drop shadows. Its controls stay 48px, the minimum in UI.md rule 1.
- The map now spans the full width. At 412x915 it is 410x618.
- Short phones (640px tall or less) drop the title bar and the satellite view, so the map gets every pixel.
- Docs updated in this PR, as the person asked for this UI: GAME-DESIGN.md section 6, UI.md rule 2 and CONTRIBUTING.md.

## Status row and toast (options A and B)

- The person picked A and B from the brainstorm on the stacked text bands under the HUD.
- **A:** the goal moves into the 2045 bar's row, on one line. The next star hides behind a tap on the goal (▾). The meter keeps its "2045" label and percentage, and still explains Emas on tap. Under 360px wide its track drops out, so the goal keeps its line.
- **B:** the log line is now a toast over the bottom of the map. It shows for 3s, then fades. Tapping it opens the Log, and every notice still lands in the Log (Menu > Log).
- The map at 412x915 grew from 410x618 to 410x716.
- Light and Dark share one layout. Only colour tokens differ, and an e2e test compares the boxes of every main-screen part in both themes.
- The toast's class is `notice-toast`, because `.toast` is already the top-level popup style.
- ART.md gets a UI chrome section for the frame's look, as the person asked for the art guide to change too.
