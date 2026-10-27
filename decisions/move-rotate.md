# Move and rotate

- Moving and rotating are free and live in the inspector (not on paths, which are single tiles you can demolish).
- Move reuses the placement bar and the floating Place button. The building hides from its old tile while the ghost shows the new one, and it may overlap its own old tiles.
- Rotate is a mirror, stored as `Building.rot` (0 or 1). A footprint is square, so rotating never changes which tiles it covers. Window lights mirror with it.
