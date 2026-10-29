# Tutorial tips fire on actions, and the combo is taught by doing one

Julian, 2026-10-29. TODO items "Tie tutorial tips to an action, not to a timer" and "Teach the combo mechanic in the tutorial".

- **No tip reads the month.** Each one fires from a player action or a state it explains (`when` in `src/ui/howto.ts`). A unit test checks every trigger gives the same answer at month 0 and month 200.
  - Beds and a reason: the first arrival, or Popularitas below 40 (the month-2 fallback is gone).
  - Combo: the player's first shop or facility opens (anything but Rumah, Kantor RT, paths and the tukang parkir), while no combo is found.
  - Jobs: a resident takes a job at a building the player built. The Kantor RT's PNS seats fill on day one, so PNS does not count.
  - Wacana: the one-time Popularitas warning has fired, or Popularitas is under 45.
  - Report card: the first yearly ranking is in.
- **Each tip says the gain.** The Wacana tip opens with "Popularitas falling?" and points at Menu, Policies (EN now says Orang Inside, not Orang Dalam). The report card tip lists what the score counts.
- **Combo, by doing one:** the combo tip names the cheapest combo the player can set up now (`easiestCombo`, the same pick as the goal strip) with its buildings as sprites joined by "+". A piece the player owns is named as the one to build beside ("Build Pos Ronda next to your Kantor RT"). When the first combo is found, after its fanfare, a second tip ("Combo saved.") says it is kept in Menu, Combo. That tip is `tipOnly`, so How to play keeps one combo card. Both are tap-to-continue tip cards with no Skip (UI.md rule 10).
- **Kept as is:** the goal strip order from #151 (the combo leads from month 30 or when the star waits on it). The tip carries the early nudge, so the strip did not change.
- Tips stay 60s apart (GAME-DESIGN.md section 3, target 7).
