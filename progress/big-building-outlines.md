# Big building outlines

Shipped: 2x2 and 3x3 buildings draw with the same 1px outline as one-tile buildings, instead of a stretched 2-3px one.

- `Painter.upscale(n)` in `src/render/iso.ts` makes the big art. `iso()` caches it per footprint.
- The map draws big art at its own resolution. Tap picking, art tops and window-light hiding read its pixels at the right size.
- Tests: `tests/art.test.ts` checks the outline on 2x2 and 3x3 boxes, and the border band of a bare 3x3 field.
