# Every building moves as itself; every combo fires

- New e2e test: every building at every level shows its level pips on the map, and its move ghost matches it (sprite, house variant, footprint, level, turn) when picked up and when carried. The ghost now draws level pips too.
- New unit test `tests/combo-all.test.ts`: all 36 combos fire when built on legal lots, are listed in the Buku Combo, stop when a member moves out of range, and fire again when it moves back.
- Fixed Agustusan Akbar (could never fire; combo range now counts edge to edge) and Wisata Kolam (named a retired building).
