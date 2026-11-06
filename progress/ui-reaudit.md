# Full UI re-audit (T11)

- `npm run audit:ui` crawls every screen on four stages at four widths, two languages and two themes, and writes `audit/report.md`.
- The first run found 13 density fails on the 17 Agustus panel, the Kecamatan's Wacana and Neighbours, and one event. All are fixed. A dark-theme contrast problem on the staff stat icons is fixed too.
- `tests/event-words.test.ts` checks every event body and choice length.
- Every screen now passes, apart from the allowlisted Settings and Warga.

See `decisions/ui-reaudit.md`.
