# Menu click sound

- One document-level click listener in `src/audio.ts` plays the existing `tap` sound for any enabled `button` or `[role="button"]`.
- `app.tap()` now only fires haptics, so a button press does not play the sound twice.
- Muted (sound volume 0) and disabled or `aria-disabled` controls stay silent.
