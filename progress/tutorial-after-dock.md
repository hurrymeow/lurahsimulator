# Tutorial fixes after the dock and two-row top bar

The opener, How to play and tips still described the old layout, and one opener step pointed at a card off screen.

- **Opener, Pick step (320 and 360px):** the Housing list puts Jalan Setapak first, so the Rumah card the note pulses sat below the fold. The coach now scrolls a pointed-at sheet card into view, only when it is out of view. New e2e check: Rumah is fully in the viewport at this step.
- **Opener, Done step:** "pause or speed up below" now says "at the top", where play and speed live (EN and ID).
- **How to play / tip 1:** "Open Menu, tap Build" now says "Tap Build at the bottom". The picture row drops "Menu ›" and the unused `how.pic.menu` string.
- **How to play / tip 5:** "Change one in Menu, Residents" now says "in Residents at the bottom", since Warga left the Menu for the dock.
- **How to play / tip 8:** "Pause or speed up at the bottom" now says "at the top".

Locally the full e2e suite passed except the 412px screenshot baselines. Those are drawn in CI's Playwright image and differ in this container's font rendering on an unchanged main too. CI on main was green.
