# Portrait pixel scale

2026-11-08. Playtest, after `progress/staff-portrait-style.md`: the staff portraits still looked unlike the
walkers on the map, and the player suspected the outline thickness.

**Cause:** the map never draws an art pixel smaller than 2 CSS px (`MIN_SCALE = 2`). The 44x60 portrait slots
(Staf list, applicants, detail view, coach) drew 44x60 art, so one art pixel was 1 CSS px: every outline, seam
and eye was half as thick as a walker's. Inem's 88x120 plate on event cards was already 2 CSS px an art pixel,
which is why she looked right there.

**Decision:** portraits in a 44x60 slot are 22x30 art, shown at 2 CSS px an art pixel.

- `portraits.ts` keeps its layout on a 44x60 half-pixel grid and snaps it to art pixels; the face is drawn
  natively like a walker's: 1px ink eyes two pixels tall, a three-pixel wink arc, one rosy pixel per cheek,
  a small smile or an open grin with a pink tongue. Brows are gone (at this size they sat on the eyes and
  read as a frown); glasses are a thin rim through the eyes, since a full frame read as a visor.
- Seams (ART.md, Outlines) stay only on the back hair and the chest, a line round the collar. On the face
  or arms a 2 CSS px line is as heavy as an eye, and walkers carry none.
- Inem gets a hand-finished 22x30 version (`inemSmallURL`) for the Staf list and the coach. Her plate keeps
  the 44x60 art.

Updates the docs: ART.md, Walkers and portraits (a new line on the portrait scale). Every hire keeps their
face; the seeded look is unchanged.
