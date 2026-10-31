# Back gesture and map gestures

Source: UI.md review checklist items 7 and 8; TODO "Make the phone's back gesture and map gestures safe".

- One guard history entry is pushed at load and re-pushed after every back. Back then closes the top layer: how-to, sheet, card, placing. It never changes the layer stack, so no per-panel history entries.
- An event card is never skipped by back (it needs a choice).
- On the bare map the first back shows "Press back again to leave" for 2s. A second back inside 2s leaves. A stray swipe cannot lose the session.
- On the home screen back leaves at once; nothing is at risk there.
- `overscroll-behavior: none` and `touch-action` were already set on body and map. Sheets now also use `overscroll-behavior: contain`.
- Code: `src/ui/back.ts`. Test: `tests/e2e/ui.spec.ts`, "the phone back gesture closes the top panel and asks before leaving".
