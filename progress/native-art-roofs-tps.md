# Native-size big art, tidy edges, roof shapes, TPS

Shipped:

- 2x2 and 3x3 buildings are drawn natively: smooth 1px edges and diagonals instead of scaled stair steps.
- Ground borders are pixel-thin at any size. Lapangan has a stone kerb and sunken chalk lines, flat pieces get a dither into the grass, and the upgrade kit is a 1px plank fence or stone wall.
- Roof shapes (hip, pelana both ways, shed, flat dak) with roster vents, weep holes, batu alam and tandons on houses, and a different roof for each shop type.
- Bank sampah is an open TPS with no roof.
- Tests in `tests/art.test.ts`: smooth diagonals at 2x2 and 3x3, pixel-thin borders, every roof shape distinct and none taller than the hip, and old one-letter rumah variants unchanged.
