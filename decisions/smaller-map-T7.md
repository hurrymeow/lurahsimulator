# Smaller map T7: camera and baselines

Plan: `docs/plans/smaller-map.md`, task T7.

- **`HALF_ZOOM_GRID_W` is gone.** The Kelurahan is 28 tiles wide and the threshold was 52, so T5 had already made it dead code. No stage's opening scale changes here.
- **No baselines are refreshed.** The five visual baselines are all RT screens, and this PR changes no pixels there. CI's visual spec checks that. The plan expected a refresh, but there is nothing to redraw.
- **The district ring stays as it is.** Beside 28x36, the three blocks sit on open sawah with clear gaps and do not overlap the map. They look bigger next to the smaller Kelurahan, which reads fine. The screenshots are in `progress/`.
- **New test:** every stage opens at scale 2 with the player's Kantor RT in view.
