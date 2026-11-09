# T4: the Kecamatan bot feeds its households

The Kecamatan bot now notices when `fedBase(s) < households(s)` and builds food instead of homes: a Toko Kelontong on the seam, falling back to a Warung when that placement did nothing, while treating the kampung as full until the hunger is covered. The choice follows the game's own measure of hunger (`fedBase` against `households`) rather than a bot-side heuristic, so the bot's build order matches what a player reads on the Perut meter.
