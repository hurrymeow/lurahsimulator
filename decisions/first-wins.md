# First wins get the big celebration

- Only the first house (Rumah finished), first resident and first star get it. Everything later keeps the small feedback (rubric 11).
- It is a label over the map, an 8-coin burst into the money chip, a glow, a 450ms zoom punch on the map and a rising six-note chime. Nothing blocks input.
- The star skips the chime because its fanfare card already plays one.
- "Camera nudge" is a zoom punch, not a pan. A pan fights the player's own pan and the tutorial pointer.
- Once per game via `GameState.firsts`. Older saves get it filled from what they already reached, so they stay quiet.
- Effects off: the label and sound stay, coins, glow and punch are skipped.
