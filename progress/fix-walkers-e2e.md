# Fix walkers E2E

The "residents walk the map" test flagged an ojol rider as inside the damaged warung at (6,7). Auto-jobs had paved a jalan on that tile, so the rider was on a road. The game is right; the seed overlapped a road. The test now ignores buildings that sit on a jalan tile.
