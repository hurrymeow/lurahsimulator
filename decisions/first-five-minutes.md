# First five minutes

Playtest of the live site at 390px showed the tutorial taught buttons, not the loop.

- **Goal strip.** One line under the Emas bar shows the next star goal. Not tappable, so it costs 32px, not 48px.
- **Guided first Rumah.** After "Got it" on a new game, a bar walks Menu, Build, Rumah, tile, Place. The step comes from what is on screen, so backing out returns to the step before. Skip ends it for good. Continue and old saves never see it. Rumah is the first build because it is instant and fixes the full beds the player hits within seconds.
- **Off under `?debug`.** E2E tests start new games constantly. `?debug&coach` turns it on for its own test.
- **One housing tip.** "Fill the houses" and "Room and a reason" merged into the second. Fires on the first arrival or a full housing.
- **One tip a minute.** Real time, skipped under `?debug`. Tips also wait while the opener runs.
- **Orang Inside tip** waits for a permit of 2 or more months. A 1-month permit ends before the tip helps.
- **Unlock popups** say the count and "New ones are marked". Build shows a New tag on each card and a dot on its tab, until the Build sheet closes once.
- **Not done:** a "Beds full" ticker line. The Pop chip already goes amber, shows "!" and pulses (#66).
