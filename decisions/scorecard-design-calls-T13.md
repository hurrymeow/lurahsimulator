# T13: stuck shopkeeper seed and the two stalled takeovers

Executor PR #444 only added a measure file, with no write-up. I ran it and finished the diagnosis here. #444 is closed.

## Shopkeeper seed 10 is no longer stuck
Since #434 every shopkeeper seed (1 to 10) reaches all 9 stars. Seed 10 reaches RT 2★ at 6.0 min. Its last open line is Combos (2 of 2); Ranking wins flip at 1.5 min and Residents at 2.7 min. RT 2★ on seeds 1 to 10 sits between 5.2 and 7.1 min. No fix needed.

## Takeover seed 3 (random, 100 ticks): bot fault
State at takeover: RT 0★, Rp 8.7M, 22 residents, Combos 0 of 1.
- The builder's `buildCombo` picks the cheapest combo, Sayur Segar. It needs `warung@3`, a level-3 Warung.
- The builder rings the level-2 Warung at (3,8) with four Kebun Sayur, but never upgrades the Warung. The upgrade costs Rp 10.4M and the bot never saves for it.
- The strip names a different combo the whole time (Pos Ronda + Warung + WiFi). The bot ignores it.
- A player reading the strip would get the star. Cause: `buildCombo` counts a combo as one build away when a member needs an upgrade.
- Fix (next plan): `buildCombo` skips combos whose need has a level the standing member lacks, unless it upgrades that member first.

## Takeover seed 5 (random, 100 ticks): bot fault, with a game risk to check
State at takeover: RT 0★, Rp 0.87M, 16 residents. Every Rumah, the Warung and every Pos Ronda are off the road (`noRoad`).
- During the takeover cash goes below zero (Rp -0.96M by tick 150) and Kantor RT is damaged. The builder only buys two Biopori.
- The builder never demolishes or moves an off-road building, so nothing new is road-fed and no combo can fire.
- A player can demolish and rebuild beside the road, so this is not a soft-lock in the game. The bot just lacks that move.
- Game risk to check in the next plan: a map built off-road plus debt may leave no affordable recovery. Measure it with a takeover bot that demolishes off-road pieces.

## Item 23 effect
Both stalls are bot faults, not soft-locks. Item 23's takeover check should read 13 of 15 with these two named, until the bot fixes land.
