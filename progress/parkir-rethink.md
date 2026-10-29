# Tukang parkir rethink

- New `src/sim/parkir.ts`: `spawnParkir` (moved from projects.ts, with chance, cap and the Kantor rule), `checkTertibkan`, `tertibkan` and `parkirSystem` (comebacks). `PARKIR` constants in balance.ts.
- Tertibkan button and help line in the tukang parkir's inspector.
- Strings and blurbs updated in EN and ID (shops say "may draw", how-to 7).
- Tests: chance, cap, never beside the Kantor; tertibkan with Orang Dalam and with a Hansip; comeback. e2e: tertibkan from the panel (id and en at 320).
