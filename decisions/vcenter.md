# Labels sit in the vertical middle (UI.md rule 18)

TODO item "Centre button and bar text vertically" (Hari, 2026-11-01, screenshot at 412px ID).

## What the measure found

`tests/e2e/vcenter.ts` takes a Range over each label's text, adds its icons (images and aria-hidden drawn icons, with corner badges left out), and compares the space above and below inside the border. Run over the home, setup and main screens, the open goal list, every Menu panel, the Build tabs, Warga, the promotion card and four event cards, at 320 and 412px in ID and 320px in EN:

| Screen | Element | Above / below | Cause |
| --- | --- | --- | --- |
| Promotion card | Terima SK, Terima sebagai Pak Lurah, Tetap di sini | 0 / 26 px | `.sheet > .btn { display: flex }` with no `align-items`, so the label stretched from the top |
| Main screen | Goal pill, one-line goal | 1 / 9 px | `.cs-goal-float .goal-now` used `align-items: flex-start` |
| Setup | Acak (dice) icon button | 8 / 14 px | an inline image sitting on the text baseline |

Nothing else was off by more than 2px.

## Fix (shared CSS, not per screen)

- `.btn` has `align-items: center`, so any button laid out as flex centres its label. `.sheet > .btn` also centres it across (`justify-content: center`), like every other full-width button.
- The goal pill centres its text and arrow.
- `.btn-icon > img` is a centred block.

## Check

UI.md gains rule 18, a table row and a review-checklist line. The e2e test `vertical centring` in `ui.spec.ts` runs the measure in CI at all four widths. With the CSS fix reverted, it fails on exactly the three rows above. The HUD screenshot baseline changes slightly, because the goal pill text moves down to centre.

## Verdict

Self-approved under the TODO approval rule. The test passes at 320, 360, 412 and 430px in ID and at 320 and 412px in EN, and the whole of `ui.spec.ts` passes at 320px ID.
