# The objective, names, Inem and warga pressure

- `src/sim/needs.ts`: Perut, Kerja, Aman, Sejahtera, preman (turning, uang keamanan, reform) and the Laporan score.
- `src/data/realisasi.ts`, `src/sim/realisasi.ts`: the real version of each policy, its delay, effects and landing notice.
- `src/i18n/index.ts`: `setPlayer`, `{pt}` `{pn}` `{pk}` placeholders and `.bu` twins. `src/ui/home.ts`: the naming step with dice.
- `src/render/inem.ts`: Inem's portrait as palette rows. `src/app.ts`: `inemHead()` on message and event cards; the 2045 meter shows Sejahtera; the meter card lists the meters and the Laporan. `src/ui/coach.ts`: her face in the opener.
- `src/ui/panels.ts`: Realisasi under each Wacana. `src/ui/inspect.ts`: the uang keamanan line.
- `src/sim/gain.ts`: the Popularitas soft cap. `src/sim/jobs.ts`: Satpam held for preman; any job ends a preman.
- Tests: `tests/needs.test.ts`; i18n covers Realisasi strings; balance bot builds Pos Satpam for preman; e2e for the naming step, Realisasi panel and meter card; visual baselines use fixed names.
