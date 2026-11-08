# Staff portraits in the game's art style

2026-11-08. Playtest: the generic and special staff portraits looked unlike the rest of the game,
next to Inem on the same Staf list.

## Why they looked different

Inem is hand-pixelled to ART.md; the other portraits come from a parts painter
(`src/render/portraits.ts`) that skipped several ART.md rules, so they read as flat vector avatars:

- **No seam lines.** Only the outer silhouette had an outline. ART.md, Outlines: a 0.55x line runs
  wherever two forms meet. Hair, face, neck and body ran into each other as flat colour.
- **Flat shading cut by a straight vertical line** down the chest, with no light on the top left.
- **Dot eyes.** 2x2 ink dots. ART.md, Faces: oval ink eyes with a one-pixel sparkle, rosy cheeks
  `#f07f86`, an open smile with a pink tongue, a closed arc for a wink. Cheeks used another pink.
- **A dome for a body**, no arms, and long hair as a hard rectangle.

## What changed

- Every part (back hair, arms, chest, neck, ears, head, hair, each prop) paints with its own id. A
  line pass gives the part behind a 0.55x seam where a part in front meets it, as on the map.
  Thin details (eyes, brows, glasses, mustache, outfit prints) share their part's id.
- Shading follows the form: a curved shade round the right side, a light on the top-left shoulder,
  a lighter left cheek, and a sheen on the hair.
- Oval ink eyes with a sparkle (one row lower under glasses, inside the frame), a happy arc for a
  wink, `#f07f86` cheeks, and an open grin with a pink tongue.
- Arms at the sides with a sleeve seam, a gently tapered jaw, and long hair rounded at the ends.

Every hire keeps their face: the look seeded from the staff id is unchanged; only the painter is
new. `tests/portraits.test.ts` checks the seam and the eye sparkle.

Follows the docs (ART.md, Outlines and Faces).
