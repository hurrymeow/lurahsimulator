# Tip dismiss test fix

e2e (3) at phone-320-id was red on main after #156. `dismissModals` tapped the centre of `#modal`. A tip card's stat icon can sit there, and a tap on a stat icon shows its name instead of closing the card (#130). The helper now taps the dim corner. No game code changed.
