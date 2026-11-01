# Warung draw hint (T1)

Changed the `placeableDefs().filter(...)` condition in `bestDraw` (`src/sim/nextstep.ts`) to exclude defs already built, and added a test beside the existing draw test in `tests/nextstep.test.ts`: with a Warung Sembako standing, free beds and population at the attract target, `nextStep` no longer returns a draw step naming it. The new test fails without the filter change and passes with it; the existing draw test still passes.
