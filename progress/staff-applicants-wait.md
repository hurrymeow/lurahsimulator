# Staffing: applicants wait, arrive as a card, and show a count

- `APPLICANTS.keepMonths` removed: applicants stay until hired or cancelled.
- The arrival notice is a modal card with a button that opens Staff (`Notice.open`, `card` on notice fx).
- Count tag on the Menu's Staff tile and on the Menu button (`ActionButton.badge`, `countTag`).
- GAME-DESIGN.md updated. Unit test (applicants still there after 24 months) and e2e test (card → Staff, count on Menu, hire clears it).
