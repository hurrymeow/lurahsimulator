# Kecamatan inspection variants

- Hari (2026-10-29): the inspection was stale, the same warning and score card each time.
- Each inspection is now an event in the pool (`src/data/events.ts`): `kecamatan` (Kampung Bersih), `kecamatanTertib`, `kecamatanSehat`, `kecamatanDigital`. Each has its own team, text, two prep shortcuts and a line for a pass carried by shortcuts.
- They keep `chance: 0`: the inspection system still raises them on its schedule, because the 2-month warning and the prep window need a fixed date. A random draw could not give that lead time. Random events still keep clear of them as before.
- Criteria (`INSPECTIONS`): the old four stay as the Kampung Bersih set and as a base the others draw from; new ones are Aman, Perut, health posts, WiFi and Viral, each 0 to 25.
- The first visit is always Kampung Bersih, so the opening stays as tested. After it, a random other team, never the same twice in a row.
- Rewards and thresholds are unchanged.
