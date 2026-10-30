# Stat icons, PR 2 and PR 3

- `src/i18n/events-id.ts`, `src/i18n/id-content.ts`, `src/data/combos-more.ts`: plain escapes for "Lubang Viral" and the Urusan Surat story.
- `src/i18n/en.ts`, `src/data/buildings.ts`, `src/data/events.ts`, `src/data/wacana.ts`: English uses "Orang Inside" and "Virality".
- `src/i18n/id.ts`: `insp.restartODn` without the doubled key, `exp.viral.what` reworded.
- `src/app.ts`: the explainer card title keeps the stat's word.
- Tests: `tests/statIcons.test.ts` checks English never uses the Indonesian stat words and the two plain escapes; the chip explainer e2e checks the title keeps its word.
- Follows the docs.
