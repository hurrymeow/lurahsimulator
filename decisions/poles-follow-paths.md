# Wires follow the paths

2026-11-03. From a playtest screenshot, the owner asked why the poles and cables passed UI.md rule 17 ("map art stays in its footprint").

They broke it. Each new pole was wired to the nearest earlier pole anywhere within nine tiles, so a span cut diagonally across the kampung, over houses and empty lots. On the starter lanes one span ran from the back row of the loop to the front row through the kantor and the houses, and on screen it read as a black tower standing in the middle of them. All wires were drawn after everything else ("they hang high, so they draw over the buildings"), so houses in front of a wire never hid it.

It passed because rule 17's check only places each building type and diffs the neighbouring tiles. Poles and cables are not buildings, so nothing tested them.

## What changed

- `src/render/poles.ts` (new, pure): a pole is wired only to the nearest earlier pole on the same row or column, at most nine tiles away, with path on every tile between. Poles on one row or column stand on the same side of it, so the wires run along the path. A pole with no such neighbour stands unwired.
- `src/render/cables.ts`: each span is cut into one slice per path tile under it, and the slices join the map's back-to-front pass with the poles. A building in front of the path now hides the wire. The draw-everything-last pass (`drawPathCables`) is gone.
- `tests/poles.test.ts`: every wire runs between two poles on one straight run, over path tiles only, on the starter lanes and on 40 random path layouts. This is rule 17's check for poles and cables.
- ART.md's Poles and cables row says the same.

The owner chose UI.md over the old ART.md wording ("please fix it"), so ART.md is updated to match.
