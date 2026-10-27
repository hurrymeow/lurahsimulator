# First 15 minutes: pacing and polish pass 1

- The opening menu unlock ("8 buildings unlocked") no longer pops on the first month. It sat on top of the guided first Rumah and is the starting menu, not a reward. Later unlocks still celebrate.
- The first Kecamatan inspection warning moves from month 12 to month 15. Month 12 already carried the yearly report and the ranking result, so three pop-ups landed back to back.
- The four starting Build tabs share one row (tighter tab padding), so the first Rumah card shows without scrolling.
- The Rumah blurb no longer says "no permit" because the meta line under it already does.
- Reference: Kairosoft keeps the opener to one thing at a time. Report, ranking and a new system explainer should not stack.
- Speech bubbles are queued and painted after buildings, window lights, weather and badges, so no layer covers them. An e2e check records the draw order of a night frame and fails if anything paints after the bubble.
- English goal lines read "Combos found: 0 of 1" instead of "1 combos found", so no count needs a plural.
