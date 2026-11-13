# Scorecard with the road rule on: first numbers and A/B

Nightly run 43496110656 on main (2026-11-13, after #415 road rule on, #419 row 27 bar, #420 bunting, #421 Orang Dalam visit). Rows 2, 3, 4, 9, 22 and 27 read Pass. Row 17 (no dominant strategy) flipped from Pass to Fail.

## What moved with the rule on

Median star times in minutes, 10 seeds. Before = committed scorecard of 2026-11-09 (it also lacks other changes since):
- Builder: RT 2★ 6.9 to 14.7, RT 3★ 13.5 to 19.7, Kel 3★ 38.4 to 62.4.
- Shopkeeper: RT 1★ 1.9 to 12.7 (9 of 10 seeds), RT 2★ only 3 of 10 seeds, no RT 3★. Random and cheapskate also fall.
- Item 1 longest wait 240s to 472s. Item 14 lowest cash goes negative (builder -2.2M, idle -40.2M), so the cash-health text needs a look.

## A/B on the same main (builder, shopkeeper, cheapskate, seeds 1 to 3, local)

Only the road rule differed:
- Builder RT 1★ / 2★ / 3★: off 1.5 / 6.7 / 13.2; on 0.3 / 12.7 to 15.6 / 17.6 to 19.9.
- Shopkeeper RT 1★: off 1.9; on 13.5, 11.1, never in 80 min.
- Cheapskate RT 2★: off 11.6 to 12.1; on 23.3 to 36.7.

The rule is the cause, not the other merges since 9 Nov. The trace and fix are in `decisions/scorecard-road-rule-bot-fix.md`: a bot gap in combo placement.

## Left
- Rerun the Nightly after the bot fix and refresh rows 1, 14, 17, 23 and the star table.
- Row 14 shows negative cash: check the recorder, since the sim does not go below zero.
- The Nightly's screen-bot jobs (412 en, 360 id) fail apart from this change.
