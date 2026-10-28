# Popup queue waits for a quiet moment

- `src/ui/popupQueue.ts`: pure `canShowQueued` rule, 500ms idle gate, plus sheet, placing, home and how-to checks.
- `src/app.ts`: `modal()` only queues, the frame loop is the only shower for queued popups and event cards, dismiss hides at once and the next card waits.
- Tests: unit test in `tests/popupQueue.test.ts`, e2e check in `tests/e2e/ui.spec.ts` (a card queued right after a tap stays hidden at 200ms and appears after the idle wait).
- E2e helper `dismissModals` now waits for the 500ms gap between queued cards before giving up.
