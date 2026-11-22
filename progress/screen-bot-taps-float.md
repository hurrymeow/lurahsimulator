# The screen bot taps the map, never the Place/Cancel float

- `placeOnMap` skips points that are not on the map canvas. Its taps had been landing on the float's ✕, which ended placing. The 412-en bot goes from 3 of 55 to 22 of 63 checkpoints right, and the 360-id bot plays its full run (23 of 82) instead of timing out. The next blocker (combo pieces placed apart) is in `decisions/screen-bot-taps-float.md`.
