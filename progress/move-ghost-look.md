# Moving keeps the building's look

Picking a building up to move it drew its ghost as a fresh level 1 sprite with the default roof, so a
level 3 house or a blue-roofed rumah turned into a plain orange bungalow until it was put down. The
ghost now carries the moved building's level and house variant (roof colour, roof shape, wall
colour) as well as its turn. New e2e test: a level 3 rumah keeps its level and variant while moving,
before and after the ghost is tapped onto a new tile.
