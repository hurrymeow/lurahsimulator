# Scorecard bots: two combo loops that sank the builder at RT 2★

TODO item "Scorecard bots: reach RT 3★ again after the 2nd-RT change". The cause was not the 2nd RT.

Bisecting the builder bot over commits (seeds 1 and 2, 700 weeks) put the start at #285 (minimarkets moved to 2★, cheaper prices): before it the builder reached the Kecamatan, after it the bot stayed at RT 2★. #285 only changed the order things open, which exposed two bugs in `buildCombo` (`tests/scorecard/driver.ts`):

1. **A combo piece with a level.** Pecel Lele needs `rumahMakan@3`. The bot dropped the level, saw both pieces on the map, judged them "not touching" and bought one more Rumah Makan beside the pond every week: 177 of them and Rp 13.7 billion idle by week 400, with 14 houses. Now, when every piece stands and one needs a level, the bot upgrades the copy nearest the anchor and never buys more copies for it.
2. **The "one more copy beside the anchor" fallback had no cap.** With no free tile near the anchor the copy landed elsewhere, so the combo never formed and the bot bought again: 142 Wifi towers. Now it stops at the usual per-kind cap plus one.

With both fixed, the builder reaches the Kecamatan by week 400 on seeds 1 and 2. The game itself is unchanged: a player who reads the Pecel Lele hint upgrades the Rumah Makan.
