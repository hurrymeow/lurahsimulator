# The 2nd RT: T5, its tutorial

Plan: `docs/plans/second-rt.md`, task T5.

Four steps, after the RW promotion notice:
- **Arrive:** the map moves to Kampung Sebelah and time holds. Inem says it is yours, and Got it moves on.
- **First build:** the note points at Build and stays until the player builds in Kampung Sebelah. While placing, it asks for a free spot there.
- **Letters:** a tip card at the first letter.
- **Stars:** a tip card when the first building opens there.

Coach steps lock nothing, since the player already knows how to build. Tips still keep the 60 s gap. A save already at the RW with a build in Kampung Sebelah skips the coach steps.

The test is in `tests/e2e/ui.spec.ts`, under "growing map", not in a new spec file as the plan said, because that file holds the helpers it needs. It passes in `phone-320-id` and `phone-320-en`, and I checked the arrival, build and letters screens by eye in Indonesian at 320 px.

Next: T6, the AI RT tutorial.
