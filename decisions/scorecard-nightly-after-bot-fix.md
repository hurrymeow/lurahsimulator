# Scorecard after the road rule and the bot fix: second Nightly

Nightly run 43507934436 on main (2026-11-13, after #422). Compared with run 43496110656 (before the fix).

## Verdict
- The bot fix worked. Builder RT 3★ 10.7 min (band 9 to 12), shopkeeper RT 1★ 4.9, RT 3★ 11.2. Before: 19.7 and no RT 3★.
- Item 1 longest wait fell from 472s to 208s. Still over the 60s bar: Fail.
- Item 14 builder lowest cash is now 0.0M. The idle bot still shows -40.2M: the recorder, not the sim. Open.
- Item 17 stays Fail. RT 1★ ratio is 18.25x only because builder reaches it in 0.3 min and shopkeeper in 4.9. The bar needs a 2 min gap; this is a bot-order effect, not a dominant strategy. Open.
- Rows 2, 3, 4, 9, 22, 27 Pass.
- Item 23: RT 2★ late in 10 of 10 seeds, 2 of 15 takeovers stall. Open.
- Item 13: Orang Dalam B1 never spent. Open.
- Screen-bot jobs (412 en, 360 id) fail apart from this change.

## Left (for the executor, one plan task each)
Rows 1, 7, 10, 11, 12, 14 (recorder), 15, 17, 21, 23 and the Unknown rows 8, 16, 18, 24, 25.
