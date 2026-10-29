# Build mode waits for a tap

Hari, 2026-10-28: the building dropped in the middle of the view blocks the map and invites mistaps. Julian picked "wait for a tap" on 2026-10-29. This replaces his earlier "ghost shows at once" (#118): the free spots still show at once as glowing diamonds, so it is plain where the building can go.

- Picking a building places no ghost. The bar says "Tap a glowing free tile". The first tap on a free tile puts the ghost there, and Place then confirms. A mistap only moves the ghost.
- If no free spot is on screen, the map pans to the best one (`bestSpot`, the old suggestion rule) without placing anything.
- Moving a placed building is unchanged: its ghost starts where it stands.
