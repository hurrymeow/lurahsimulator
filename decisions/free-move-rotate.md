# Free move and rotate

- Repositioning and turning are free. Demolishing gives back only half and makes the player pay the full price again, so a mis-tap punished them twice. Move keeps `level`, `invested`, `status`, `timer`, `owner` and `placedAt`; only `x` and `y` change. Rotate only changes `rot`.
- `checkMove` reuses the ground rules from `checkPlace` through `tileGaps`, but skips price and requirements and ignores the building itself. Moving still respects the map edge, occupied tiles, AI RTs and the RT/seam lot type.
- A house can move with residents in it: the beds never leave the kampung. Demolish keeps its old guard.
- Non-removable buildings (Kantor RT, tukang parkir) can move. "Cannot be removed" is about demolishing, and a bad first placement should be fixable.
- Four quarter turns, rendered by remapping the painter's side-face callbacks rather than keeping four sprite sets. Back faces mirror the opposite front face because the art only paints the two faces the camera sees. The result is exact enough for placeholder art, and the sprite cache only grows four entries per variant. Roof texture and flat ground pieces do not turn.
- `Building.rot` is optional and absent means 0, so old saves load without a version bump.
- UI: the inspector carries Move and Rotate side by side. Move reuses the placement bar and its ghost, so rotating works before and while moving. Cancel leaves the building untouched and keeps its old rotation, because the turn is only written on Place.
- At 320px the extra rotate button squeezed the price line. The placement bar now wraps the info onto its own row below 341px, with `overflow-wrap: anywhere` as a fallback.
