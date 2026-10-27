# Big building outlines

- **Big buildings keep a 1px outline.** A 2x2 or 3x3 building used to draw its one-tile sprite stretched n times, so its outline came out 2 or 3px thick beside the 1px outline of a warung. Now `iso(name, variant, n)` scales the fills and face ids before the ink pass, and the outline and face lines are drawn on the big canvas.
- **Paint details still scale.** Windows, roof courses and plank lines get n times bigger, which matches a bigger building. Only outlines and face edges are redrawn.
- **Bare ground sprites thin their own border.** Lapangan and sawah skip the ink pass and paint a dark band round the field. On a big lot, that band keeps only its outer pixel, and the rest takes the colour just inside it. This keeps the art as drawn, with no per-sprite edits.
- **Scaffolding is not thinned.** It is bare lattice with no outline, so its poles scale with the building.
- **Fixed in passing:** a big building with no road access drew at one tile's size and unmirrored. It now draws at its footprint like every other status.
