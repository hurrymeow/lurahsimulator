# Tukang parkir: spawn less, and tertibkan

Julian, 2026-10-29. Picked (a) spawn less and (b) a way to clear one, from the TODO item.

- **Spawn:** the first shop always draws one. After that, 30% per shop, at most 4 on the map, never within one tile of a Kantor. Stage buildings with `spawns` (Pasar Kaget, the Kelurahan market) skip the roll but respect the cap.
- **Why the first is guaranteed:** at 30% from the start, the balance bot lost its 2★-by-year-4 pace (5 of 10 seeds, down from 8 or more). The first tukang parkir's retribusi (about Rp 60rb a month) is a real part of the early kas, and the bot only afforded Wi-Fi (the second combo) because of it. Guaranteeing the first keeps the economy and the joke's first showing, and the bot is unchanged.
- **Tertibkan:** from his panel. It is free if a Hansip is on staff and not away, otherwise 1 Orang Dalam. He still cannot be demolished. There is a 30% chance he returns to the same shop 3 to 6 months later, if it still stands (`parkirBack`).
- Inspection: the penalty still counts tukang parkir on the map, so fewer of them means a better score. Unchanged.
- Old saves: `parkirSeen` is true if the save has any open shop or tukang parkir, so a long-running kampung does not get a surprise "first" one.
