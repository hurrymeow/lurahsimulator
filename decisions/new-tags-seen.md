# NEW tags clear only when the card has really been seen

From the TODO item "NEW tags that clear only when the card has really been seen" (`decisions/playtest-sk2.md`, UI.md checklist item 4).

- **Before:** closing the Build sheet marked every visible building as seen. One star unlocks several things, and their NEW tags were gone after a single glance at the first tab.
- **When a card counts as seen:** a card's NEW clears once the card has been at least half on screen for 2 seconds (an IntersectionObserver on the sheet), or when the player taps the card or its info button. Opening and closing the sheet alone clears nothing.
- **Badges:** a tab's badge goes when no card under it is unseen. The dock's Build badge goes when no building anywhere is unseen. The seen list is saved as each card is seen, so the badges stay right after a reload.
- **First look:** the very first Build screen of a game still counts the starter set as seen, so a new game opens with no NEW tags.
- **Leaving the list:** the 2s watch stops when the list is swapped for a building's detail or the Combo book, and starts again on the way back.

Verdict (self-approved): the e2e test checks four things:
- NEW survives opening and closing the sheet.
- A tapped card clears at once.
- Each tab's cards clear after 2s on screen.
- The dock badge goes when all are seen.

It passes at 320 and 430px ID and 412px EN. The Build, tutorial and density specs pass.
