# Audio unlocks on every gesture, not only the first

Reported 2026-11-07 by the owner: no music in the live build. In headless Chromium the live code plays (oscillators are scheduled, the context runs), so the silence was the device's autoplay rule, not the score.

`src/audio.ts` created the AudioContext on the first `pointerdown` (or `keydown`) and never tried again. iOS Safari, and some Android WebViews, only let audio start inside `touchend` or `click`, so that context stayed suspended for the whole session: no music and no sound effects. A context paused by a phone call (iOS `interrupted`) also never came back.

Now:
- `pointerdown`, `touchend`, `click` and `keydown` all call `start()`, every time. It is cheap once the context runs.
- `start()` resumes any context that is not `running`, and the first one plays a silent one-sample buffer inside the gesture, which older iOS needs.
- A rejected `resume()` is caught, so it never shows as a console error.

Not changed: on iPhone the ring/silent switch still mutes web audio, as it does every web game. Forcing playback through it (`navigator.audioSession.type = 'playback'`) would also stop the player's own music app, so that stays a separate choice.

Follows the docs.
