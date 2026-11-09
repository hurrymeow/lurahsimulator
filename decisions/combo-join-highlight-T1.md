Added `comboJoinTiles` to `src/sim/combos.ts` so the placement UI can ask the sim which tiles would join a combo. It treats the candidate building as a one-tile footprint, finds every live combo whose needs include the id, and highlights a tile when an owned building (any status) fills another need of that combo within its radius, ignoring level requirements. Keeping this beside the combo rules avoids duplicating combo logic in the UI.

Review (Claude, 2026-11-09): diff matches the task and touches only the listed files.
