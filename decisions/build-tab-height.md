# Build tab row stays put

The Build sheet is bottom-anchored, so a short tab (few buildings) shrank the sheet and moved the tab row under the finger. The list now has a minimum height of one screen, so the sheet always fills to its 75dvh cap.

Stage sheet: the SK buttons used to sit inline at ragged widths. A direct `.btn` child of a sheet now stacks at full width.
