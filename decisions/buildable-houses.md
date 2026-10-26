# Buildable houses, visible population (playtest feedback #1)

- Rumah is a normal building now: Rp 800k, instant, houses 3, attracts 1, and the player places it. It used to appear for free whenever a resident arrived, which hid the population rule and left the Build menu with no population lever.
- Population is `min(attract, housing)`. Attract is what pulls people in: base 4, plus each working building's `attract` × level. A house adds 1, a warung 2, wifi 3. Tried 2 per house first; the autoplayer then filled the whole map with houses and amenities stopped mattering.
- The 1★ goal drops from 12 residents to 10. With attract 1 the opening (2 houses + warung + pos ronda next to the Kantor) reaches 10, not 12, and the star should land on the first session.
- No free houses on arrival. The one exception is the pacing valve: 8 months with no new resident and a perantau turns up with his own house, so a neglected kampung still moves. It needed its own `lastArrival` stamp because the quarterly report resets `lastNovelty`, so the old valve never fired.
- Housing that residents still live in cannot be demolished. The check is dynamic (housing − this house < population), so it covers Kos-kosan too.
- The numbers that were invisible are now on screen: residents, beds and how many want to live here sit at the top of Build, on every building card, in the inspector and in the Pop chip's explain card. A tip fires at the first stall and names both levers. The old copy said people move in "while a house is free", which was never the whole rule.
