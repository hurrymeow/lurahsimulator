# The ghost no longer follows a hovering mouse

Julian could not place anything in a new game with a mouse. Since #118 the ghost followed a hovering mouse, and the Place and Cancel buttons follow the ghost, so on the way to Place the cursor kept moving the ghost and the buttons slid away from it (32px and 48px in the repro). The click landed on the map and nothing was built. Touch was not affected.

- A hovering mouse no longer moves the ghost. A click on a tile moves it, and a press on the ghost drags it, for mouse and touch alike. This replaces "A mouse moves it by hovering" in `decisions/build-menu-ux.md`.
- New e2e: a mouse sweeps across the map to Place, the button stays where it was, and the click builds the house.
