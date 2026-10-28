# Resident tap wins, popups wait for sheets

- `src/render/people.ts`: new `Crowd.hit` and `Crowd.onTile` for walker taps.
- `src/app.ts`: map taps check walkers before buildings, and modal/event cards defer while a sheet is open, with the frame loop showing them after close.
- `src/ui/panels.ts` and `src/main.ts`: resident sheet is now reachable from a map tap via `app.openResident`.
- Tests: unit test in `tests/people.test.ts`, e2e tests in `tests/e2e/ui.spec.ts` for walker taps and queued popups.
- Follows the docs: strengthens the existing auto-pause rule, no doc change needed.
