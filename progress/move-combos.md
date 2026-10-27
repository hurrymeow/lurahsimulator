# Moving a building now finds combos at once

- Moving a building into a combo announces it right away. Before, the notice waited for the next month tick.
- Combo discovery is split out of the monthly system so both paths share it.
- The combo cache key now includes the no-road flag.
- Test: tests/move.test.ts moves a building into a combo, then away again.
