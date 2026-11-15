# Place and Cancel no longer flash at the corner

The placement float is positioned the moment it shows, not one frame later. This was the real cause of the flaky Place and Cancel e2e test. `decisions/place-float-first-frame.md`.
