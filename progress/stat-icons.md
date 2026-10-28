# Stat words become HUD icons, PR 1

- `src/ui/statIcons.ts`: pure `splitStatText` and `groupStatSegments`,
  DOM `richText`, `decorate` and `observeStatIcons` with a
  MutationObserver on document.body.
- `src/main.ts`: observer wiring after console setup.
- `src/style.css`: `.stat-icon`, `.stat-pair` nowrap, `.stat-toast`.
- `src/ui/lists.ts`: Buku Combo tiles show data chips from `perMonth`
  and `incomeMult`, with `cEffect` as `aria-label` and fallback.
- `src/i18n/en.ts`, `src/i18n/id.ts`: new `combo.perMonth` key,
  `/mo` in EN, `/bln` in ID, in both tables.
- `decisions/resource-names.md`: Icons section updated to the shipped
  HUD icons, replacing envelope and phone.
- Tests: unit tests in `tests/statIcons.test.ts` for every word in
  both languages, whole-word boundaries, Rp amounts untouched,
  plain escapes, observer idempotence and number pairing. e2e test
  in `tests/e2e/ui.spec.ts` for combo chips, detail icons, icon tap
  toast and Rp amounts staying words.
- Follows the docs, except the resource-names.md Icons update noted
  above, which Hari decided in the task brief.
