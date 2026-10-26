# Free move and rotate

Shipped: Move and Rotate in the building inspector, both free. Move reuses the placement bar, keeps level/investment/permit/timer, and blocks only invalid ground. Rotate cycles four quarter turns and previews in the ghost. The map draws every building with its own orientation.

Code: `checkMove`/`move`/`rotate` in `src/sim/rules.ts`, `rot` on `Building`, yaw support in `Painter`/`iso`, inspector buttons, `#place-rotate` in the placement bar, EN/ID strings.

Tests: `tests/move.test.ts` (8 cases) and a `free move and rotate` E2E block covering the inspector buttons, the placement-bar rotate, a free move and the saved rotation. Typecheck, 184 unit tests and the full Playwright suite pass: 321 passed, 3 skipped, 324 total.
