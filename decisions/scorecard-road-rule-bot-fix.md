# Road rule: the shopkeeper stall was a bot gap

Follows `decisions/scorecard-road-rule-ab.md`. Call (coordinator, Hari: use best judgement): bot gap first, loosen the rule only if a player would hit the same wall.

## Cause
Two bot habits the road rule exposed (`tests/scorecard/driver.ts`):
1. A combo piece bought "beside" a partner (`spotFor` with `around`) ignored the road rule, so it could land on a tile with no path beside it. It did not work, so it did not join the combo.
2. Flat pieces (Kebun Sayur) stand in the gaps away from streets. When the road-fed partner (Warung) was 7 tiles away and the combo pointer found "all pieces on the map", the bot only upgraded or copied the partner, never built a new flat piece beside it. A player builds the Kebun Sayur next to the Warung.

## Fix
`around` placements now need a path beside them (unless flat, decor, Kantor or RW or Kelurahan scope). `buildCombo` buys a new flat piece beside a working road-fed partner before the upgrade branch.

## Result (seeds 1 to 3, local, rule on, medians in min)
- Builder RT 2★ 8.8, RT 3★ 10.8 (was 14.7 and 19.7 with the bug; 6.9 and 13.5 on 2026-11-09). RT 3★ is back inside the 9 to 12 min band.
- Shopkeeper RT 1★ 4.7 to 7.3 (was 13.5 or never), RT 3★ 11.2 to 12.3.
- Cheapskate RT 2★ 16 to 20.7 (was 23 to 37).
RT 2★ stays slower than rule-off (6.7): a player needs paths too, so this is the rule's real cost, not a bot gap. Judged against GAME-DESIGN.md §8 items 1 and 4. The Nightly after merge refreshes the full table.
