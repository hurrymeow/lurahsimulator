# Seam gap and RW buildings on RT lots

- `src/sim/types.ts`: `SEAM`, `CELL_W`, `CELL_H`, `mapSpan()`; `setGrid` adds the seams between cells.
- `src/sim/area.ts`: lots and seams on the gapped layout; `cellOrigin`, `ungapTile`.
- `src/sim/grow.ts`, `neighbourView.ts`: AI RT cells from `cellOrigin` and `cellOf`.
- `src/sim/save.ts`: moves old grown saves apart (`gapped`).
- `src/sim/rules.ts`: RW and Kelurahan buildings may go on RT lots; new `sim.needKelLot` text.
- Tests: grow unit tests on the new layout, save migration, lot rules; the takeover e2e taps the Kantor RT it took.
- Screenshot check at 390px: the RT looks the same before and after promotion, with the seam road outside it.
