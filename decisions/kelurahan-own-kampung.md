# Kelurahan stars read the player's own kampung

TODO item "Slow the Kelurahan down and make its stars read the player's own kampung", from findings 1 to 3 of `decisions/kelurahan-playtest.md`. Built before Hari picked the goals, by the claimer's choice; Hari reviews the numbers in the PR.

## Root cause: the Stempel never scaled

The playtest's empty kampung was not only missing goals. On a Kelurahan map all 15 AI RTs sent their Surat Pengantar to the player, while stamps stayed at the RW rate (3 a month, +1 for the Balai RW, +1 per Calo). The backlog grew without end and drained 15 to 50 Popularitas a month. Popularitas sat at 0, residents left, and no goal on the player's own kampung could ever be met.

Fix: at the Kelurahan, only the RTs in the player's own RW send letters to the player. The other RWs stamp their own. The player is still the permit queue for their own RW, as at the RW stage. With this alone, the playtest bot's kampung grew to 140 to 250 residents with Popularitas 35 to 80, but star times did not move (3★ at month 82).

## New goals

Each Kelurahan star now also needs the player's own kampung at a size and a Popularitas, held at the same time:

| Star | Added goals | Existing goals |
| --- | --- | --- |
| 1★ | 50 residents, Popularitas 50 | every RW at 1★, serapan 80% for a year |
| 2★ | 120 residents, Popularitas 45 | every RW at 2★, 1 Piala Kelurahan win, a clean Tim Audit |
| 3★ | 200 residents, Popularitas 40 | 3 Piala wins, every RW at 3★ |

The Popularitas bar steps down as the resident bar rises, on purpose. Expectations cost 0.14 Popularitas per resident a month, so a big kampung settles lower: about 30 to 40 at 250 to 300 residents with mostly Pos Ronda, and 50 to 70 at 200 with Kolam Pancing and Panggung Senam. Residents never leave above Popularitas 15, so a kampung that overshoots cannot shrink back. A high bar at 3★ would trap such a player at 2★; 40 at 200 residents stays reachable by building Popularitas.

Rejected: 60 at 200 residents and 45 at 220. The bot passed the resident bar with Popularitas in the mid-40s and never got back above it.

## Pacing

`tests/kel-bot.test.ts` now plays like a careful Lurah: Popularitas buildings beside a road, strongest first, while Popularitas is under 70, and no new homes while it is under 55. Months at 8s each:

| Seed | Dana | 1★ | 2★ | 3★ |
| --- | --- | --- | --- | --- |
| 1 | manual | 72 | 107 | 147 (19.6 min) |
| 3 | auto | 65 | 100 | 143 (19.1 min) |
| 4 | auto | 62 | 97 | 139 (18.5 min) |
| 6 | auto | 64 | 99 | 140 (18.7 min) |
| 2, 5 | manual | 77, 78 | not in 18 years | |

Before: 3★ at 11 to 15 minutes. Now about 19 minutes for a bot that never hesitates, against the 30-minute target. The bot test pins 1★ at month 48 or later and 3★ between months 120 and 180.

Seeds 2 and 5 fund every RT every month by hand, so their own RW's letters pile up (backlog 5 to 20) and keep Popularitas under the bar for years. A player who hires a Calo or funds less does not hit this. Their goals were all met by year 18.

## Open for Hari

1. The numbers in the goal table.
2. The bot lands near 19 minutes, not 30. Getting closer needs a slower AI side (RW stars come by month 80 to 110 on every seed) or bigger kampung goals, which raise the trap risk above. Pick one, or accept 19 as the bot's lower bound.
3. Pos Ronda has no `maxCount`; the bot built 20 to 90. A cap would push players to the new Popularitas buildings.

Updates the docs: GAME-DESIGN.md section 2, the Kelurahan 1★, 2★ and 3★ goals, and both Stempel lines (RW content and the systems list).
