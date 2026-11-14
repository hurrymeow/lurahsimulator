# T7 progress

- `GAME-DESIGN.md`: B0 Hook novelty max changed from 10s to 16s (two ticks).
- `tests/scorecard/scorecard.ts`: `NOVELTY_MAX_S` B0 entry changed from 10 to 16. The band-table bar text is built from that array, so no separate string change was needed.
- `npm run typecheck` and `npm test` pass (693 passed, 9 skipped); `npm test` includes `tests/scorecard/harness.test.ts`.
