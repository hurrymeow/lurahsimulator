# Walker taps no longer block the tile under them

- `Crowd.hit` uses the walker's drawn sprite rectangle; the 48px padding and the ground-tile fallback are removed.
- New e2e: a walker standing on a Jalan Setapak opens on a sprite tap, while taps on the tile's corner and bottom open the path.
- Unit tests cover the sprite edges.
