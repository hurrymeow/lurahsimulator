# Menu click sound: one delegated listener

**Decision:** play the click sound from one capture-phase document listener, not from each button.

**Why:** the sound was only on some buttons, through `app.tap()`. A delegated listener covers every button, including ones added later, with no per-button code.

**Trade-off:** any clickable element that is not a `button` or `role="button"` gets no sound. Give such elements `role="button"` if they need one.
