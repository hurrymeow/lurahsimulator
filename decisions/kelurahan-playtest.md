# Kelurahan playtest, and a proposal for Kecamatan and above

GAME-DESIGN.md section 2 says Kecamatan and above wait for a playtest of the Kelurahan. This is that playtest, and a proposal for Hari to decide on. Nothing here is built.

## How it was played

A bot, not a person. It mirrors `tests/kel-bot.test.ts`: a new game promoted to the Kelurahan path with Rp 60jt, which funds every RT (two seeds by hand, two on Auto-dana), places each Kelurahan building once a seam lot fits it, spends spare cash on anything placeable, skips permits, repairs and restarts, and takes the free choice on every event. 12 years per seed, seeds 1 to 4, on main after #175. A bot never hesitates, so its times are lower bounds (section 3).

| Seed | Dana | 1★ | 2★ | 3★ | Cash at year 12 | Months under 25 Popularitas |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | manual | month 28 (3,7 min) | 64 (8,5 min) | 84 (11,2 min) | 102jt | 138 of 144 |
| 2 | manual | 28 (3,7 min) | 66 (8,8 min) | 85 (11,3 min) | 96jt | 139 |
| 3 | auto | 56 (7,5 min) | 83 (11,1 min) | 110 (14,7 min) | 98jt | 130 |
| 4 | auto | 50 (6,7 min) | 77 (10,3 min) | 104 (13,9 min) | 96jt | 135 |

## Findings

1. **Too fast.** 3★ came in 11 to 15 minutes at 1x. The target is about 30 minutes, a star every 10. Even as a lower bound, half the target is a miss.
2. **The only gate is the AI.** Serapan, the Piala win and the clean Tim Audit were met early every time. Each star then waited only on "every RW at N★", which Dana and Auto-dana buy. The Kelurahan plays itself once it is funded.
3. **Popularitas does not matter.** It sat at 0 for 130 to 139 of 144 months on every seed, and the player's own kampung shrank to 2 to 9 residents. No Kelurahan goal reads the player's own Popularitas or population, so the Lurah wins with an empty kampung.
4. **Sejahtera is easy with nobody home.** The 2045 meter read 86 to 100 with 2 to 9 residents: Perut and Kerja are 100 when there is almost no one to feed or employ. Sidang Emas would reward an empty kampung.
5. **Studi Banding has no cap.** The bot built more than 60, because each counts as spent toward Serapan. A player can do the same and fill the seams with it.
6. **Cash piles up.** Every seed ended near Rp 100jt with nothing left to buy after 3★.
7. **Mangkrak lingers on Auto-dana.** Seeds 3 and 4 had 94 and 170 building-months stuck mangkrak, because the bot rarely had the doubled restart price on hand.

These are open work for the Kelurahan itself, before or alongside Kecamatan. They are added to TODO.md in the docs change.

## Proposal: Kecamatan (Act 2, Pak Camat)

Act 2 is approved as Kota: Camat, Pj. Wali Kota, Pj. Gubernur, with pinjol, judol and Aman as the pressure. This sketch keeps the rules for every stage (stars 0 to 3, an SK, stars never drop, a checklist with have and need).

- **Map.** A Kecamatan is several Kelurahan. Drawing them all at tile level would be about 120x150 tiles and fail the frame-rate test. Proposal: the player's own Kelurahan stays the live map, and the other Kelurahan show as a ring of simplified districts the player taps into, like the neighbours row today.
- **The new verb: Musrenbang.** Each year every Lurah (AI and the player) sends proposals up. The player ranks them with a fixed budget. Funded proposals raise that Kelurahan's stars; the ones not funded cost Popularitas there. This reuses Anggaran and Serapan, one level up.
- **Pressure: pinjol and judol.** Warga with no job or an unfed household can take a pinjol. Debt cuts Perut over time, and a collector event cuts Aman. Judol ads spread with Viral. The Camat's tools are Satpol PP raids (cost Orang Inside, raise Aman, cost Popularitas), literacy programs (Realisasi: slow, real), or a Wacana banner (fast, fake). Satire targets the system (apps, ads, raids that move the problem next door), never people who borrow or play.
- **Stars.** 1★: every Kelurahan at 1★ and the Musrenbang spent. 2★: Aman over 60 across the Kecamatan, and the player's own kampung at Popularitas 40 or more. 3★: pinjol households under 10%, and a Piala Kecamatan win.
- **It fixes the Kelurahan findings.** Goals read the player's own Popularitas and population (finding 3), Sejahtera counts households, not percentages of nobody (4), cash has a sink in Musrenbang (6), and the AI is one input among several (2).

## Above Kecamatan, in one line each

- **Pj. Wali Kota (Kabupaten/Kota):** an acting post by SK. Districts are the map. The verb is the RPJMD target sheet, where Laporan and Sejahtera start to pull apart.
- **Pj. Gubernur (Provinsi):** the verb is choosing which reports go to Pusat. Pinjol and judol are now regional, and so is the Aman fallout.
- **Act 3, Pejabat Pusat:** Sidang Emas 2045 reads the Laporan against Sejahtera for the four endings already in section 1.

## For Hari to decide

1. Fix the Kelurahan findings first, or alongside Kecamatan?
2. Kecamatan map: a live ring of simplified districts (proposed), or a separate district screen?
3. Musrenbang as the Kecamatan verb, yes or no?
4. Pinjol and judol mechanics as sketched, and the satire line (systems, not borrowers)?

Until Hari decides, GAME-DESIGN.md is unchanged.
