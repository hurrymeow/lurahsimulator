# Applicants wait (staffing fix)

- Playtest: posting a lowongan never got anyone hired. Applicants arrived as a 3-second toast and went home 2 months later, about 16 seconds at 1x, so most players never saw them.
- Applicants now wait until the player hires one or cancels. Only one lowongan is open at a time, so a forgotten posting just blocks the next one. The Staff panel shows it with its Cancel button.
- They arrive as a card that waits for a tap (like other important news), with a "Buka Staf" button. The card has no Inem portrait: she brings only events and her own gigs.
- The Staff tile in the Menu, and the Menu button, show a count of waiting applicants in the pixel New-tag style. `ActionButton.badge` is generic, so another panel can use it later.
- No refresh of an open Staff sheet is needed: an open sheet pauses the game, so no month passes under it.
- If a posting brings nobody, a toast says so and the lowongan closes.
