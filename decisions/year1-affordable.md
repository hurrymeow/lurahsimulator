# Year 1: no content the kas cannot pay for

Request (2026-11-03): play the first year, then cut or delay content that stays out of reach for lack of money.

## What the playtest found

Two runs of year 1 (48 weeks): a scripted builder over 10 seeds (`play` in `tests/balance.test.ts` style), and a browser run at 412px that spends the start money on 3 Rumah, a Warung and a Pos Ronda, then buys in a fixed order.

- Cash after the opening buys sits near **Rp 0.2 to 2 juta** for the first 15 to 20 weeks, then climbs past Rp 10 juta by the end of the year.
- **1★ lands at week 3 to 5.** The star notice and the Build "New" tag point at IndoApril (**7 juta**) and BetaMart (**6.5 juta**). In the browser run the Toko tab showed both greyed out, "Kurang Rp 4.608.600", until week 23. For the scripted builder they were out of reach for **21 to 31 weeks**; for the balance bot up to **81**.
- **Kos-kosan** (4 juta, 1★) waited 9 to 10 weeks (balance bot up to 67), **Menara Wifi** (3.5 juta, 8 residents, about week 2) 11 weeks.
- **Realisasi:** Pelatihan UMKM (3 juta) and Biopori Massal (2.5 juta) could not be bought in 27 to 32% of year-1 weeks.
- Fine as they are: every event in year 1 had an affordable choice (no blocked card in 10 seeds), Wacana, Lowongan Online, Kerja Bakti and Bansos were affordable 97 to 100% of weeks, and Barbershop, Sawah and Gudang Material waited 5 to 7 weeks.

## Changes

- **Delayed:** IndoApril and BetaMart move from 1★ to **2★** (`src/data/stages.ts`, `src/data/buildings.ts`). The scripted builder reached 2★ with about Rp 12 juta, so they can be bought soon after they open. They still need a Warung Sembako.
- **Cheaper:** Menara Wifi 3.5 to **2.5 juta**, Kos-kosan 4 to **3 juta**. Their waits drop to about 9 and 7 weeks (balance bot: Kos-kosan 67 to 14). Neither price is in GAME-DESIGN.md.
- **Cheaper:** Biopori Massal 2.5 to **1.5 juta**, Pelatihan UMKM 3 to **2 juta**. Unaffordable weeks drop to 5% and 18%. Still inside the "Rp 1 to 3 juta" band of GAME-DESIGN.md section 4. Kept visible rather than locked behind a star: a lock is as dead as a price gap.

## Checks

- Star pacing, builder bot (`tests/balance.test.ts`, 10 seeds): 1★ week 3 for all; 2★ weeks 24 to 36 (was 25 to 36); 3★ weeks 48 to 59 (was 47 to 84). Targets 4, 8 and 9 still pass.
- New guard in `tests/balance.test.ts`: every 1★ unlock becomes affordable for the builder bot within 16 weeks of the star. It fails on the old numbers (IndoApril, 17+ weeks) and passes now.
- Verdict (GAME-DESIGN.md section 8, items 1, 10, 12, 14): approved. 1★ now opens only things a year-1 kas can buy soon; the minimarkets make 2★ a bigger reward and give the late-year cash pile a sink.

Updates the docs: GAME-DESIGN.md section 2 (1★ and 2★ unlock lists) and section 3 (target 10 status).
