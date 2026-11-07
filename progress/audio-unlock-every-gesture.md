# Audio unlock on every gesture

- `src/audio.ts`: every tap, click or key retries starting audio; a silent buffer unlocks older iOS; suspended or interrupted contexts resume on the next gesture.
- Checked: a production build plays music after one tap in Chromium; the ui.spec tests for volume, pause and taps pass at 412 (id).
- Details: `decisions/audio-unlock-every-gesture.md`.
