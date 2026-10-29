# Building ladder and building shapes (Oct 30)

Hari approved the proposals doc; Julian reworked the sizes (Decisions, Oct 30).

## Ladder, first pass

- Apotek 3,5jt to 6jt, income 300rb to 550rb. Koperasi 4jt to 8jt, 350rb to 700rb. Bengkel 3jt to 4,5jt, 280rb to 420rb. Pasar Kaget income 300rb to 450rb.
- The balance bots (`balance`, `rw-bot`, `kel-bot`) pass unchanged.

## Sizes

- 1x2: Kos-kosan (8 beds, was 6 at 1x1), Bengkel, Posyandu, Pasar Kaget. 2x2: Koperasi, Balai RW. Lapangan 3x3 to 2x3. Terminal 2x2 to 3x3, the only 3x3.
- Lapangan was idle outside August. It now earns 120rb a month (sewa lapangan), covering its 100rb upkeep, and gives +0,5 Popularitas a month.
- Terminal, the landmark: 18jt to 25jt, and a 3-tile boost of 20% for shops round it (the decoration `boost` rule). `isCover` now means a booster with no income, so Terminal still floods and still counts for the ranking.
- A 3x3 cannot fit a 2-tile seam, so Terminal stands inside the player's RT lots (allowed since #165).

## How a long footprint works

- `footprint` is a number (square) or `[w, h]`: w tiles along the map's x axis, h along y. `sizeOf(b)` swaps them when `rot` is 1.
- Turning a square building only mirrors it, as before. Turning a long one swaps its sides round its top corner, so `checkRotate` needs the turned footprint free; the inspector shows what is in the way.
- In this projection a horizontal mirror swaps the map's x and y axes, so one drawing along x covers both turns: the mirrored 2x1 lands exactly on the 1x2 lot.
- Art: `Painter(1, fa, fb)` with `at(u, v)` composes long sprites from one-tile pieces (two stalls, two kos blocks, clinic plus porch, workshop plus car bay); `groundLong()` paints the field. Square 2x2 and 3x3 reuse the existing art at their own size.
- The map reads each sprite's footprint and top corner from the art (`Art.w`, `h`, `cornerX`, `cornerY`), so square, stretched and long art share one draw path. Sites under permit or construction put stakes and scaffold on every tile and one crane on the back tile.
- AI RTs place a big building only where its whole footprint is free, turned if that fits; with no room they build a house.

## Old saves

- A building that grew keeps its spot: it takes its new size where it fits, else turned, else it keeps its old square size (`small`) until the player moves it. Nothing is demolished or refunded. `sized` marks a save as done.
