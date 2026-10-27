# Map zoom and the Warga list

- **Zoom is in whole scale steps, from 1 to 6.** Whole numbers keep pixel art crisp. One wheel notch (50-120px, by screen scaling) or the same trackpad scroll is one step. A two-finger pinch steps each time the fingers spread or close by a quarter, and pans with their midpoint. Both zoom around the pointer or the pinch. + and - zoom from the keyboard.
- **Scale 1 is an overview.** Its tiles are below the 32px tap size. Zooming back in restores that, and the default view is unchanged.
- **A grown map resets the zoom,** so the Kelurahan still opens at half size.
- **A pinch is never a tap.** Lifting the fingers does not inspect a building, and one finger left after a pinch pans from where it is.
- **After picking a job, Warga reopens at that resident.** The row scrolls to the middle and takes focus. Before, the list jumped back to the top.
