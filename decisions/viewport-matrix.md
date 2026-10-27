# E2E viewport matrix

Hari (2026-10-27): test 320, 360, 412 and 430px wide, in EN and ID. 390 is dropped. 412 and 430 use installed-app heights (915 and 932).

Why: the home map bug on a 412px S25 Ultra slipped past CI, which only ran small phones at browser heights. 390 sits between 360 and 412 and adds little.

Cost: 8 projects instead of 6, spread over the same 6 shards. Raise the shard count if shard time grows toward the 10 min cap.
