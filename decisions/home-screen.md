# Home screen

- Start asks Continue or New game; Continue appears only when a valid save exists. A no-save player still sees the choice (New game only), so Start always behaves the same.
- New game confirms only when a save would be overwritten, with a red "Wipe and start over" button.
- The sim holds (`app.held`) while the home screen is up, so the map idles and the kampung does not age.
- Home sits at z-index 10, below sheets and modals, so the gear opens Settings over it.
- New game from home clears the how-to flag and all tips, so the tutorial runs again. Continue never shows it.
- Audio needs no code here: the existing first-pointerdown hook starts it on the Start tap.
