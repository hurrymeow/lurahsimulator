# Build tabs, floating Place, path lines

- Build tabs: housing, shops, facilities, farm, decoration, paths. Only tabs with something to build show. The last tab used reopens. `category` on the def wins; `src/data/categories.ts` maps the older ids so the content thread can tag new ones without editing this PR's files.
- Place and Cancel float just under the chosen footprint (above it near the bottom edge) and follow pans. The bottom bar keeps the name, cost and what is missing, plus a Cancel for when no tile is chosen yet.
- Paths: tap the start, tap the end, tap Yes. The path is an L. It bends whichever way has fewer blocked tiles. Tiles that already hold a path are skipped, blocked tiles are skipped and counted. A third tap starts a new path. Cancel leaves build mode.
