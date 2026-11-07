# Wide 2x2 art

- `src/render/iso.ts`: `Painter.zs` and `low()`; box, roofs, blob, stroke and set use it for heights. Stakes redrawn in native pixels; scaffold low.
- `src/render/art-content.ts`, `src/render/art-higher.ts`: 15 big sprites call `p.low()`; walls and roofs raised on the squat ones; Terminal canopy.
- `tests/art.test.ts`: two checks. ART.md: the low rule, the measure and the exceptions.
