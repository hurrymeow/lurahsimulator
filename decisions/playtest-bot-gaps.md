# Playtest bot gaps: result (2026-11-09)

Plan: `docs/plans/playtest-bot-gaps.md`. Merged: #377 (screen rule), #382 (scorer), #381 (Kec pinjol tools), #389 (Kec food). Bot code only. No `src/` change.

## Bot fixes (done)
- Screen bot saves for a locked building instead of rebuilding an owned one (#377).
- Scorer counts a wait as right when the named building was unaffordable. Reads sim state; the player does not (#382).
- Kec bot builds 2 Koperasi, 1 Balai Latihan Kerja, runs Literasi Keuangan, builds food when households outnumber food capacity (#381, #389).

## Result (Nightly 42554451472 and 42559010715)
- Screen bot: 31% right (15 of 49), bar 90%. RT 3★ not reached. Unchanged by the fixes.
- Kecamatan, 8 of 10 seeds in cache: still 0 stars in 700 weeks. Pinjol 55 to 71% at the end (was 29 to 51% before the fixes). Judol mean 70%. Promotion at week 409 to 433.

## Real game findings (not bot bugs)
1. Combo pieces must sit side by side. The screen says "place side by side: Kantor RT, Pos Ronda" and does not say where. The bot owned Kantor RT and four Pos Ronda and never formed Rapat Malam. A new player may stall the same way. Check by hand.
2. The hint path reaches Kecamatan promotion with about 460 residents, 154 households and food for 50. Two in three households are hungry and borrow, so pinjol sits above 25% and Kecamatan 1★ cannot come. The bot adds food and tools and pinjol does not fall. Either the tools are too weak against that start, or the bot cannot recover without pulling homes down. Needs a design call.

## Not fixed (needs Hari)
- Screen bot: place a combo piece next to its partner (tile geometry from the canvas).
- Kec bot: cap population before promotion on the hint path, or let the bot demolish homes. Both change what the 10-seed check means.
