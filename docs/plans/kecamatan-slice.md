# Kecamatan slice (Act 2, slice 1)

Approved by Hari, 2026-10-31 ("ok" on the draft in the planning thread "Plan Kecamatan as first Act 2 slice"). Builds on `decisions/kelurahan-playtest.md`.

## Goal

Add the first playable Act 2 stage, Kecamatan (Pak Camat), so the run goes past Act 1. Act 1 ends at about minute 27 for the builder bot against an 8h run (`scorecard/scorecard.md`, item 25). This slice brings the first Act 2 pressure (pinjol, judol, Aman), a bigger map, its own stars and a new verb. It is playtested before the next slice.

## Decisions and why

1. **Act 2 ships in playable slices, Kecamatan first, with a playtest after each** (Hari, option C). A full Act 2 in one go cannot be tuned; a slice can.
2. **Map: a ring of simplified district blocks** (decision A). The player's Kelurahan (58x74) stays the live tile map. The other 3 Kelurahan show as low-detail district blocks around it, seen on pinch-out, and tapping one opens its panel, like the Neighbours row. Why: a 2x2 Kelurahan map at tile level is about 118x150 tiles and would fail the frame-rate gate. Against: the map grows less than "bigger map" suggests, since the player builds only in their own Kelurahan.
3. **One new pressure and one new verb.** Pressure: pinjol and judol, which hit Aman and Perut. Verb: the response (razia, literasi, or a banner). This meets section 8 item 24 (a new system per stage).
4. **Musrenbang waits for slice 2** (decision B). It keeps this slice small enough to playtest. Against: AI Kelurahan then have only Bantuan as a lever, which the playtest found plays itself (finding 2). Mitigation: each AI Kelurahan has its own pinjol share that funding alone does not clear.
5. **Numbers below are a first pass** (decision C). The balance bots tune them; log changes in `decisions/`.
6. **The Kelurahan playtest findings are fixed in parallel** (decision D), by the scorecard thread that already owns them. This slice does not wait for them, but re-baselines its times after they land.
7. **AI Kelurahan are modelled, not simulated**, as AI RT Sabar is (`decisions/growing-map-engine.md`). Each has stars, a pinjol share and an Aman value, driven by Bantuan (Dana one level up) and its own trait.
8. **Satire guardrails** (GAME-DESIGN.md section 5). Borrowers and players are never the punchline; the joke is the app, the ad and the razia that moves the problem next door. No playable gambling. No real app, lender or agency names.
9. **No save migration.** Promotion into Kecamatan adds new state; an incompatible save shows the start-new prompt (Hari, 2026-10-31).

## Mechanics (first pass)

- **Pinjol:** a household (3 residents) where most members have been idle **24+** weeks (Hari, 2026-11-01), or one that is unfed, has a **3%** chance a week to borrow. In debt, it counts as unfed half the time. After **24** weeks in debt, a debt collector event cuts that RT's Aman by **5**. Meter: share of households in debt.
- **Judol:** spreads with Viral. Each **10** Viral above **20** adds **1%** a week to start. A judol household loses **30%** of its income and borrows at **2x** the rate. Meter: share of households on judol.
- **Responses:**
  - Razia Satpol PP: **1** Orang Inside, Aman **+8** for **8** weeks, Popularitas **−3**, half the cases move to the next Kelurahan.
  - Literasi Keuangan (Realisasi): **Rp 3jt**, lands after **8** weeks, new cases **−50%** for **48** weeks.
  - Spanduk Anti Judol (Wacana): Laporan up, nothing real.
- **Gate:** pinjol and judol start only at Kecamatan. Act 1 stages are untouched.

## Stars

- **0★ Pak Camat:** unlocks Kantor Kecamatan, Pos Satpol PP, the pinjol and judol meters, and Bantuan.
- **Goal for 1★:** build the Kantor Kecamatan; every Kelurahan at 1★; pinjol under **25%** of households; own kampung **250** residents.
- **Goal for 2★:** every Kelurahan at 2★; **1** yearly ranking win in the Kecamatan; Aman **60+** across the Kecamatan for **24** weeks; Popularitas **35**.
- **Goal for 3★:** every Kelurahan at 3★; **3** yearly ranking wins in the Kecamatan; pinjol under **10%**; Aman **65+** with no razia in the last **48** weeks.
- **3★:** the SK to Pj. Wali Kota arrives. That stage is not built; play continues. Rival: Kecamatan Sebelah.

## Pacing targets (band B5)

| Target | Bar |
| --- | --- |
| 0★ to 3★ at 1x | **55 to 65** min; bot fails below **45** or above **70** |
| Star gap | **15 to 25** min |
| Novelty max | **90s** |
| Goal max | **5** min |
| Stop point | every **20** min, next goal on screen within 5s |
| First pinjol case | within **3** min of promotion |
| Weighted first-seen points (item 11) | at least **6** per 30 min |

## Content

- **Buildings (6):** Kantor Kecamatan, Pos Satpol PP, Koperasi Simpan Pinjam, Balai Latihan Kerja, Baliho (ad income; some ads are judol), Taman Kota. All go in the player's Kelurahan lots.
- **Combos (4):** Modal Usaha (Koperasi Simpan Pinjam + Balai Latihan Kerja), Razia Pasar (Pos Satpol PP + Pasar), Iklan Bertarget (Baliho + Wifi: income and judol both up), Kampung Tertib (Pos Satpol PP + Lampu Jalan).
- **Events (6):** debt collector, SMS pinjol, judol ad in the Grup WA, the razia moves next door, a warga's debt goes viral, Tim Literasi from Pusat.
- **Staff:** Satpol PP role (Rajin: the razia works; Gaul: risk of a scuffle). 5★ applicants open.

## Tasks

Each task is one PR unless batched. Run `npm run typecheck`, `npm test` and touched e2e specs only.

1. **Stage and state.** Add `kecamatan` to `StageId`, a `KECAMATAN_STAGE` with the stars above, `next` on the Kelurahan stage, promotion unlocks, and the modelled AI Kelurahan in state.
   - Files: `src/sim/types.ts`, `src/data/higher/stages.ts`, `src/data/higher/types.ts`, `src/sim/stages.ts`, new `src/sim/kec.ts`, `src/sim/save.ts`.
   - Done: a test promotes a Kelurahan 3★ save to Kecamatan, the goal checklist shows every line with have and need, and an old save loads unchanged.
2. **Pinjol and judol.** Meters, spread rules, debt collector, effects on Perut and Aman, gated to Kecamatan.
   - Files: new `src/sim/pinjol.ts`, `src/sim/needs.ts`, `src/sim/tick.ts`, `src/data/higher/` (new `kecamatan.ts`).
   - Done: unit tests for spread, the Viral link, the income cut and the gate; no pinjol in RT, RW or Kelurahan saves.
3. **Responses.** Razia (with the move-next-door rule), Literasi Keuangan as a Realisasi, Spanduk Anti Judol as a Wacana.
   - Files: `src/data/realisasi.ts`, `src/data/wacana.ts`, `src/sim/kec.ts`, `src/ui/panels.ts`.
   - Done: tests show each moves the right score (Laporan or Sejahtera) and the razia line in the 3★ goal reads the last 48 weeks.
4. **Content.** The 6 buildings, 4 combos, 6 events and the Satpol PP role, in both languages.
   - Files: `src/data/higher/kecamatan.ts`, `src/data/eventsMore.ts`, `src/data/staff.ts`, `src/i18n/en.ts`, `src/i18n/id-data.ts`, `src/i18n/id-content.ts`, `src/render/art-higher.ts`.
   - Done: content and combo tests pass; data lint finds nothing dead; blurbs 25 words or fewer; art follows ART.md.
5. **Map ring.** Draw the 3 other Kelurahan as district blocks around the live map; tap opens their panel.
   - Files: `src/render/scenery.ts`, `src/render/map.ts`, `src/ui/neighbours.ts`.
   - Done: the Kelurahan frame-rate e2e test still passes at its current floor; a screenshot at 360px in both languages.
6. **Balance bot and scorecard.** Extend the bots to Kecamatan and add the pacing bars above.
   - Files: `tests/kel-bot.test.ts` (or new `tests/kec-bot.test.ts`), `tests/balance.test.ts`, scorecard harness.
   - Done: 10 of 10 seeds reach 3★ between 45 and 70 min at 1x; novelty, goal and stop-point bars pass for B5.
7. **Docs.** Add a Stage 4 Kecamatan section to GAME-DESIGN.md section 2 and fill the B5 star gap in section 8, with a `decisions/kecamatan-slice.md` note.
   - Done: GAME-DESIGN.md matches the shipped numbers.
8. **Playtest.** Bot playtest plus Hari's T3 check before slice 2.
   - Done: a `decisions/kecamatan-playtest.md` with findings and a proposal for slice 2.

Order: 1, then 2 and 4 in parallel, then 3, 5, 6, 7, 8. Do not touch Act 1 balance numbers in these PRs.

## Open questions

- Which AI Kelurahan traits, and how does each move its pinjol share?
- Is Bantuan a new name for Dana at this level, or the same Dana screen?
- Should Baliho judol ads be visible on the sprite, or only in the inspector?
- Slice 2 content: Musrenbang, or straight to Pj. Wali Kota?
- Does the 3★ "no razia" line feel fair, or too punishing, in Hari's T3 check?
