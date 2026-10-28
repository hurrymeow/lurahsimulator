# Pause resets the partial month on popup

- Popups already auto-paused time (`decisions/auto-pause.md`), but the partial month survived.
- A popup opened at 95% through a month fired a tick the instant it closed, so the next queued popup landed on the player's next tap.
- On the first auto-paused frame, `App` now resets the month accumulator to 0.
- A manual pause is not an auto-pause entry, so its partial month is kept.
- Closing the last holder still resumes at the same speed; no speed is touched.
