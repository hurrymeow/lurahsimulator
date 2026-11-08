# Shop jobs

Request (playtest 2026-11-09, T5): 139 of 264 warga had no job. "Lets re-evaluate. ... when players focus on growing population and build combos, the toko will still give them some job, while still needing players to optimize more buildings with bigger job impacts like PAUD." The user approved shops opening jobs with a short-staff income cut.

## What changed

- Three new jobs, filled by warga like any other (`src/data/jobs.ts`): **Penjaga Toko** (appeal 60), **Tukang Masak** (55), **Tukang Cukur** (40). They pay the kas nothing; the shop's income is their output.
- Slots per level: 1 at Warung, Toko Kelontong, Fotokopi, Apotek, Koperasi, Rumah Makan, Gerobak Bakso, Warteg, Warkop and Barbershop; 2 at Indomaret, Alfamart, Pasar Kaget and Terminal; 3 at the Pasar. Bengkel keeps its 2 ojol posts.
- A shop short of staff earns less: `1 - 0.25 x (empty posts / posts)` of its kind, pooled across the kampung (`staffMult` in `src/sim/jobs.ts`). The inspector says how many posts are filled and what it costs.

## Why these numbers

- First pass: a 40% cut and appeal 45/40/30. In the RW the kampung is short of hands, not jobs (penjaga 13 of 26 filled at week 120), so shops lost about 10% of their income and the honest bot's RW 2★ and 3★ came about 20 weeks later.
- Final: a 25% cut, and higher appeal so shop posts fill ahead of ojol. RT stars hold or come sooner; RW 2★ and 3★ come 0 to 11 weeks later (the RW is short of its target length anyway, see TODO "Stage lengths").
- Late game still has idle warga: every post fills and a Kelurahan of about 400 has about 100 idle. That is on purpose: shops soak up part of a growing kampung, PAUD, farms and offices remain the way to full employment.

## Evidence

Six bots, seeds 1 to 6, to Kelurahan 3★ (week 289), before and after (`runBot`, averages):

| Bot | Idle share | Late Aman | Sejahtera | Cash at end (jt) | RW 2★/3★ week |
|---|---|---|---|---|---|
| builder | 0.47 → 0.28 | 25 → 27 | 28 → 34 | 477 → 179 | 162/212 → 165/215 |
| shopkeeper | 0.43 → 0.16 | 23 → 27 | 30 → 39 | 1636 → 879 | 164/215 → 163/213 |
| hint | 0.52 → 0.31 | 18 → 27 | 24 → 31 | 132 → 163 | 164/214 → 165/215 |
| honest | 0.48 → 0.29 | 25 → 27 | 28 → 33 | 333 → 190 | 163/213 → 174/224 |
| pencitraan | 0.57 → 0.31 | 18 → 27 | 25 → 34 | 998 → 443 | 157/207 → 157/207 |
| safety | 0.50 → 0.28 | 23 → 27 | 26 → 34 | 453 → 223 | 160/210 → 169/219 |

- Cash at the end falls because warga who took a shop post would otherwise have been ojol or petani, who pay the kas. Cash piling up with no late sink is an open scorecard Fail (14, 15), so less is fine.
- Aman barely moves: crowding (0.3 per resident over 15) holds it down in a big kampung, not idleness alone.

Verdict: approved by the user on the direction; numbers judged by the bot runs above (TODO approval rule, 2026-11-02).

Updates the docs: GAME-DESIGN.md §4 (Shop jobs).
