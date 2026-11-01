# Blurbs without level numbers (T1)

Changed exactly three English `blurb` values in `src/data/buildings.ts`: `posRonda`, `kosan` and `bankSampah` no longer quote per-week Popularitas, housing or Rupiah figures, keeping the blurbs in line with GAME-DESIGN balance changes without touching any other string or data file. Typecheck and `npm test` pass; no e2e spec reads these blurbs, so none was run.
