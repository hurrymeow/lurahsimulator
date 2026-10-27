# Build tabs and building sizes (playtest feedback)

- Every RT building has a category for the Build tabs: housing, shops, facilities, farm, decoration, paths. They sit in one map in `data/buildings.ts` and are applied when `BUILDINGS` is built, so a new building only needs one line there. Unlisted ones default to facilities. Biopori sits under paths, since it is ground cover and joins the same tab as Jalan.
- Sizes: Lapangan 3x3, and Sawah, Taman Bermain, Balai Warga, PAUD and Gudang Material 2x2. Everything else stays 1x1, so most of the Build list is still small things. Lapangan is the biggest thing in the RT on purpose.
- The Kantor RT, Kos-kosan and every other building already in saves stay 1x1. Growing them would overlap the neighbours that sit next to them in old saves.
- Combos and decoration auras measure distance from a building's top corner, as before. A big building's far edge counts as farther away than it looks. It is simple and the player can read it.
