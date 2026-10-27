# Path decay, level art, terraced hills, icon plates

## Path decay

- **Jalan Setapak cracks at random after year 1.** Each working path has a 0.4% chance a month. On a 30-tile network that is about one crack every 8 months: a chore, not a crisis.
- **A cracked path is not road.** It reuses the `damaged` status, so road access already treats it as a gap. Buildings past it idle until it is fixed.
- **Neglect spreads it, slowly.** A stretch of joined cracked tiles grows every 6 months it is left. Each time it grows by 10% of its size, rounded, and always at least one tile, into the paths beside it. A stretch keeps its oldest crack's clock, so fixing part of it does not reset the rest.
- **Three ways to fix it:** one tile for Rp 150.000, the whole stretch at that price per tile, or 1 Orang Dalam for the whole stretch ("call a favour", the same idiom as restarting a mangkrak project). Paths cost nothing to lay, so they have their own repair price, and Virality does not waive it.
- **Decay rolls its own dice.** It hashes the seed, month and building instead of drawing from the shared RNG, so every other system rolls exactly what it rolled before. The balance tests did not move.
- **A crack shows its age.** A split line first, potholes with a puddle after 6 months. The path keeps its own art, without the sepia tint other damaged buildings get.
- **One message a month at most,** for a new crack or a spread.

## Level art

- **Eight buildings draw their own progression:** warung, pos ronda, Kantor RT, kos-kosan, wifi, bank sampah, Indomaret and Alfamart. They are the ones every player builds and upgrades. Each level changes silhouette and materials, with Indonesian details: terpal, seng, genteng, kentongan, jemuran, joglo, tiang reklame.
- **The other levelled buildings share an upgrade kit** in front of them: bamboo pagar, then pagar tembok with pots and a lamp. Hand-drawing 35 more progressions is a later art pass.
- **No level gets more than one storey taller,** and nothing but the wifi tower passes 28px, so upgrades never hide the buildings behind them. The Kantor RT's flag pole got shorter for this.
- **Level 1 is now the makeshift look.** Existing saves show each building at its saved level, so a level-1 warung becomes a tenda.

## Terraces and icons

- **The back of the map is terraced hills,** kebun teh and sawah terasering, after the flowing hills of A-Train 4's map. They are drawn from contour bands of a height field, so they flow across tile edges. Shade trees and coconuts stand on them instead of square forest patches.
- **Menu icons sit on cream plates,** after A-Train 4's tool panel. Kampung panels show a scene drawn with the game's own sprites. Abstract panels keep their glyph, inked dark.
