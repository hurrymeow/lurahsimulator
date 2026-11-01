# Cut the Desa path from the code

Plan: `docs/plans/cut-desa-code.md`. Follows `decisions/cut-desa.md`.

- `SAVE_VERSION` stays. `load` returns null only for a save with `stage.path === 'desa'`, so other saves keep working. The player gets the start-new prompt.
- `path` stays as a field with the single value `'kelurahan'`, so other code needs no change. The SK sheet shows one accept button.
- Removed with the path: Desa buildings and sprites, their combos (Panen Raya, Wisata Edukasi), the Pendamping Desa job, the Dana Desa budget cut, the Desa titles and the harvest bonus that only Panen Raya paid.
- `banjirCut` stays as a generic building hook. No Kelurahan building uses it now.
