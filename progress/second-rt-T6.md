# The 2nd RT: T6, the AI RT tutorial

Plan: `docs/plans/second-rt.md`, task T6.

Three steps, after the Kelurahan promotion notice:
- **Meet RW 2:** the map moves to the first AI RT and time holds. The note says the AI runs it and these RTs are not the player's. Got it moves on.
- **Dana:** the note walks Menu, Neighbours, an RT and the Dana button, pointing at each, and stays until the player funds an RT.
- **Other ways to help:** a tip card after the first Dana, on Kunjungan and building on free lots.

Coach steps lock nothing. A save at the Kelurahan that has already funded an AI RT skips the coach steps.

The plan's coach step sat directly on the Dana button, but that button is three taps away from the map, so the note points at each tap on the way.

The test is in `tests/e2e/ui.spec.ts`, under "growing map", like T5's. It passes in `phone-320-id` and `phone-320-en`.

Next: T4, the Kelurahan load check, then T7.
