# Scorecard bot fixes T2: buildCombo counts the upgrade

A combo that needs a level (`rumahMakan@3`, `warung@3`) was scored only by the cost of the pieces it did not have yet, so the book could rank it ahead of a cheaper combo and then stall on the upgrade the bot could not afford. `buildCombo` now adds `upgradeCost(s, copy) * (need.level - copy.level)` for every need above level 1 when a standing copy exists below that level, leaving the cost unchanged when no copy stands (the piece's own price already counts). The import comes from `src/sim/state`; the sort by cost and the existing upgrade branch are unchanged.

## Reviewer verdict

Merged. The cost change is right on its own: Sayur Segar now sorts behind Tongkrongan, as a book reader would rank them. It does not fix takeover seed 3, and the builder moves by up to 1.7 min on four star points (others earlier), which reads as combo-order noise.

Why seed 3 still stalls (reviewer trace, builder from the random state at tick 100):
- Tongkrongan (Pos Ronda, Warung, WiFi, radius 1) is now first. All three stand, but the only WiFi is at (1,15), far from every Pos Ronda.
- The copy branch calls `buy('wifi', around anchor)`. `spotFor` with `around` takes the nearest free tile beside a connected road anywhere. None exists, so WiFi stays at 1 for the whole window.
- The random bot filled the road-side tiles (Kebun Sayur, Sawah, decor and off-road pieces). The Warungs sit at level 2 and the Rp 10.4M upgrade to 3 is never affordable, so Sayur Segar cannot fire either.
- Cash holds at about Rp 9M and no star or goal line moves in 150 ticks.

So seed 3 and seed 5 share one cause: no free road-fed site. T3 gets a second step that clears one, as the Pos Ronda swap already does with Sawah.
