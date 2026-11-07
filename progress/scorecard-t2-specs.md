# Scorecard T2 specs

Added `tests/e2e/scorecard-t2.spec.ts` with three specs for scorecard rows 27 (coming back), 6 (a Popularitas fall names its cause) and 3 (the map grows with each star). They use only existing debug state (`window.pakrt`, `window.pakrtDefs`) and i18n strings, so no `src/` hook was needed. The specs were run in Indonesian and English at 412px; see `decisions/scorecard-t2-specs.md` for what each reads and cannot prove.
