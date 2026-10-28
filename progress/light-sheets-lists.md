# Light sheets, Buku Combo grid, Warga groups

- `src/ui/console.css`: Light tokens for the whole page, square corners, Light rules and shadows on sheets and pop-ups; the goal pill's one-line clamp and open state.
- `src/render/map.ts`: `RES_VAR`, resource colours as CSS variables; `src/app.ts` and `src/ui/report.ts` use it (the report's residents chip moves to `--muted`, which also fixes its contrast in Light).
- `src/ui/lists.ts`, `src/ui/lists.css`: the Buku Combo grid with filters and the Warga job groups with a summary and filters; `src/ui/panels.ts` opens them.
- `src/ui/goal.ts`: the goal opens when its line is cut or a next star waits.
- `tests/e2e/legibility.ts`: `data-clamp` inside a button is allowed to clamp.
- E2E: new tests for the combo filters and tile entry, the Warga groups and filters, and the goal clamp; the RW test opens a tile and a Warga chip.
