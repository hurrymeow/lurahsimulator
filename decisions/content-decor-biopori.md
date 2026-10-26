# Decorations, Orang Dalam cost, biopori (playtest feedback)

- Decorations earn nothing and lift the income of every shop or farm within a radius. Bonuses add up per building and cap at +60% (`DECOR_CAP`), so a packed street cannot run away. Decorations go up instantly: spare cash should always have somewhere to go.
- Bonus is a fraction per decoration, radius 1 to 3 (Chebyshev, like combos). Small ones are cheap and tight, the Air Mancur and Patung cover a wide area. Several also nudge Patience, so they are not pure rupiah.
- Decorations and paths are "cover": they never flood and never count as a building for the ranking score, so spamming pots cannot buy rank. `isCover` in `sim/content.ts` is the one place that says so.
- Orang Dalam now buys things. `orangDalamCost` on a def is spent when it is placed and shows as a missing line on the build card. First user: Patung Ikon Kampung (2 OD, strongest aura). It is the Orang Dalam version of a tender that "somehow went to a cousin".
- Selokan is gone. A drain is one connected channel, which a single tile can never be. Biopori (infiltration hole) is a real lone tile and does the same job: each level cuts banjir damage 20%. Cheaper (Rp 400k), 1 month permit instead of 3. The old `selokan` sprite stays in the art files, unused, since the artist's sprites are never overwritten.
- Saves migrate on load (`migrateSelokan`): buildings, neighbour buildings, unlocks and Kerja Bakti modifier targets. No version bump, the rename is idempotent. The inspection criterion is now called Drainage / Drainase and still counts biopori levels.
- New content ids live in their own files (`data/decor.ts`, `i18n/id-content.ts`, `render/art-content.ts`) so parallel PRs do not collide on `buildings.ts`.
