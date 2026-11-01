# Game design

The one design doc for Pak Pejabat. A satirical kampung management sim, shipped as a PWA. You play Pak RT and work up the ladder to Pak Lurah.
It replaces the old DESIGN.md, STAGES.md and PACING.md, which were deleted.
Builder rules stay in their own files: [UI.md](UI.md), [ART.md](ART.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

## Contents

1. [Pitch and core loop](#1-pitch-and-core-loop)
2. [Stage ladder](#2-stage-ladder): RT, RW, Kelurahan, Kecamatan, with stars and unlocks
3. [Pacing targets](#3-pacing-targets), with status
4. [Economy and balance](#4-economy-and-balance)
5. [Tone and politics guardrails](#5-tone-and-politics-guardrails)
6. [UI, art and tech rules](#6-ui-art-and-tech-rules)
7. [Build order](#7-build-order)
8. [Design review checklist](#8-design-review-checklist): how agents judge the mechanics

## 1. Pitch and core loop

- You are a village head. Build the kampung, keep the residents calm, and climb from Pak RT to Pak Lurah.
- **The objective, said by Inem in the first minute:** make your own kampung sejahtera before Sidang Emas 2045. The player names themselves (Pak or Bu, a name) and their kampung on New Game; the names run through the goal, the SKs, the ranking and Inem's lines.
- **Two scores.** The **Laporan** is what Pusat reads: reported residents, programs announced and carried out, Popularitas and ranking wins. Stars and SKs follow it. **Sejahtera** is what is true: the average of **Perut** (households fed), **Kerja** (warga in work) and **Aman** (safety), 0 to 100. The 2045 meter shows Sejahtera. Sidang Emas 2045 is the final review at the top act; it compares both scores for one of four endings (Pejabat Teladan, Pejabat Pencitraan, Pahlawan Tanpa SK, Dimutasi). The calendar stays Year 1, Year 2: "2045" names the review, not a date.
- **Inem** is the assistant: an aspiring dangdut singer who took the job for the income. Her portrait and name come only with events (the event card and its result), her own news (her gigs) and the opener; tips, unlocks and other messages stay plain, so she does not wear out. Now and then she flirts with Pak (never about her body, never at warga, never on bad news); with Bu those lines become cheeky best-friend lines (`.bu` string twins).
- Every joke is a mechanic that moves a number. Flavour text alone gets cut.
- The loop: build, residents arrive, money and Sabar (patience) move, events and combos fire, stars unlock more to build.
- The player never runs for office. Promotion is a performance review and an SK, the promotion letter. See [section 5](#5-tone-and-politics-guardrails).
- Bad choices slow you down. They never soft-lock the game.

### What the player sees

- Something new at least every 30s of real time at 1x: a resident, event, unlock or combo. Targets are in [section 3](#3-pacing-targets).
- Growth is visible on the map, not only in menus.

### Clarity

- Unmet requirements always say exactly what is missing.
- Discovered combos are auto-logged in the in-game Combo.
- The Combo book opens from a button (book icon plus found/total) in the Build sheet header, left of the close button, and is not in the Menu. Build still opens on the last building tab used.
- The Combo book is a column of full-width cards, one per row, under filter buttons (All, ✓ active, ★ found, ? not yet, each with its count). A card shows the name, the buildings (greyed when missing, silhouettes before it is in town) and a state mark on one line, and the effect in two lines below. Tapping a card opens the whole entry below it: effect, conditions, status and, once discovered, the story (`src/ui/lists.ts`).
- The Warga list opens on a summary line (headcount and what everyone makes a month) and filter buttons: By job (default) and No job (with its count). People sit in boxes per job, headed by the workplace sprite, the headcount and the group's monthly output; each person is a chip with their name. Warga have no star rating (stars are for staff); a resident's own sheet shows their experience as a line, such as "18 months in this job: output +40%". No job comes first, marked red.
- Speed control: pause, 1x, 2x. No 4x (Hari, 2026-10-31; removed in code, see `decisions/weekly-calendar.md`).
- Text advances on tap, never on a timer.

## 2. Stage ladder

The full ladder runs RT, RW, Kelurahan, Kecamatan, Kabupaten/Kota, Provinsi and Pusat. Stages 1 to 4 are specified. Kabupaten/Kota and above wait for a playtest of the Kecamatan. Approved by Hari on 2026-10-26.

The ladder reads as three acts (approved by Hari, 2026-10-28): **Act 1 Kampung** (RT, RW, Lurah; pressure: Perut and Kerja), **Act 2 Kota** (Camat, Pj. Wali Kota, Pj. Gubernur; pressure: pinjol, judol and Aman), **Act 3 Pusat** (Pejabat Pusat; Laporan against what is real). City and province posts are Pj. (acting) posts given by SK, so the player still never runs for office. Only Act 1 is built.

Status 2026-10-27: the map engine, RT stars, RW and Kelurahan are built. Live grid sizes are 13x17 (RT), 28x36 (RW) and 58x74 (Kelurahan): every RT is 13x17 and the seams are 2-tile dirt roads between them, outside the RTs. These replace the 9x13, 18x26 and 36x52 in the sketch below. See `decisions/growing-map-engine.md`.

### Rules for every stage

- Each stage has stars from 0★ to 3★. Reaching 3★ sends an SK, the promotion letter.
- The SK can be declined. A player who loves the RT can stay Pak RT.
- Each star unlocks content and plays a fanfare.
- The goal for the next star is a checklist. Each unmet line says exactly what is missing.
- Stars never drop. Bad play slows the next star and never takes one away.
- A higher stage's stars need stars in the stage below. AI-run areas earn stars by the same rules as the player.
- Stars show next to the stage title in the Menu header. The top bar has no room at 320px.
- Target time at 1x: RT about **12** min, RW about **20** min, Kelurahan about **30** min. That is a star every **4**, **7** and **10** min. Between stars, something new still arrives every 1 to 2 min.
- The balance autoplayer tunes thresholds to hit these times.

### One growing map

The map never gets swapped out. At each promotion the scenery edge pulls back and shows the neighbours. The player's own area stays fully playable.

```
Stage 1: RT          Stage 2: RW              Stage 3: Kelurahan

 scenery              +------+------+          +------+------+
 +------+             | YOU  | Kpg  |          | YOU  | YOU  |   your RW: your RT and
 | YOU  |   ------->  |  RT  | Seb. |  ----->  |  RT  | (was |   Kampung Sebelah, both
 |  RT  |             +--[RW lots]--+          |      | Seb.)|   yours to build on
 +------+                                      +--[Kelurahan lots]--+
 scenery              AI builds Kampung        |  RT  |  RT  |   RW 2: two AI RTs
                      Sebelah. You steer       |  AI  |  AI  |   you fund
                      it with Dana.            +------+------+
```

- RW = **2** RTs side by side: yours and Kampung Sebelah, the RT next door (playtest 2026-11-01: 4 RTs at the RW and 16 at the Kelurahan were too much to follow; `decisions/playtest-sk2.md`).
- Kelurahan = **2 RWs of 2 RTs**, 2x2 RTs in all. At promotion Kampung Sebelah joins your RW as yours to build on, like a free takeover: its buildings and warga become yours and its lots open to Build. So the Kelurahan always brings new land. RW 2 is two new AI RTs you fund with Dana.
- RW buildings go inside the player's RTs (their own and any taken over) or on lots along the seams between RTs. Kelurahan buildings go inside the player's RTs or on lots along the seams between RWs. RT buildings stay inside an RT. The seams sit between the RTs, so promotion never takes tiles from the player's RT.
- RW keeps today's 64x32 tiles. A pinch out gives a view-only overview, and a tap there zooms back in.
- Kelurahan keeps full-size tiles: at 2x2 RTs it is the size the RW used to be (it was half-size at 4x4 RTs). Kelurahan buildings take a 2x2 footprint.
- **Building sizes** (Oct 30): most buildings are 1x1. 1x2: Kos-kosan, Bengkel, Posyandu, Pasar Kaget. 2x2: Koperasi, Balai RW, Sawah, PAUD, Balai Warga, Taman Bermain, Gudang Material and the Kelurahan buildings. 2x3: Lapangan. 3x3: Terminal only. Range for combos, decorations and Kanibal counts from the nearest edge of each footprint.
- **Building ladder** (Hari, Oct 30): each unlock tier costs about 1,5–2x the one before and earns about 1,5x, a payback near 9 months, and later tiers are bigger on the map. First pass: Apotek **6jt**, **550rb** a month; Koperasi **8jt**, **700rb**; Bengkel **4,5jt**, **420rb**; Pasar Kaget **450rb**. Problem unlocks and decorations stay cheap.
- **Turning:** Rotate turns a building 90°. A square one only changes its picture. A long one swaps its sides round its top corner (1x2 to 2x1, 2x3 to 3x2), so it needs the room: the inspector lists what is in the way. While placing, Rotate turns the ghost and the free spots update.
- Old saves keep every building: one that grew takes its new size where it fits, turned if that fits instead, and otherwise keeps its old square size until the player moves it.
- This changes one rule in section 6: "tile diamonds ≥32px tall" becomes "tappable diamonds ≥32px tall".
- **Gate:** before building the Kelurahan map, it must pass the existing CI frame-rate test. Passed, after a fix. See `decisions/growing-map-engine.md`.

#### Carry-over

- Nothing pauses. Sabar, residents and the kas keep running.
- Kas RT becomes Kas RW, then Kas Kelurahan. AI areas pay iuran into it.
- Combos found earlier keep working where they stand.
- The ranking rival moves up a level. Kampung Sebelah becomes your RT, RW Sebelah becomes the rival, then Kelurahan Sebelah.

#### AI neighbours

- Every **3** months each AI RT places one building from its trait's list of 11 to 13 one-tile buildings (shops, facilities, farms and decor), each unlocked by the RT's own stars as the player's are. It builds the kind it has least of, but first the missing partner of a combo it has half built, and puts a new piece where it completes a combo when it can. Every trait can form 3 or more combos at level 1.
- The Neighbours screen shows each RT's ranking every 12 weeks: its score against the target it must beat (rising each time), what the score is made of (warga, working buildings, combos, Popularitas), and its wins so far.
- An AI RT only builds when you have funded it. An unfunded RT visibly stalls.
- Like the player, an AI RT lays **Jalan Setapak** from each new building to its Kantor RT or an earlier path, inside its own lot, and picks a spot a path can reach. Up to **3** of its warga walk its paths (at most **24** across the map), never onto the player's lots. When the player takes an RT over, its paths come with it.
- Each Dana pays for one build, and an RT banks up to **12**. Dana comes **x1** or **x6** at a time. Banked Dana speeds the RT up with diminishing returns: boost = 1 − 0.8^(banked − 1), so 3 banked is **+36%**, 6 is **+67%** and 12 is **+91%**. The Neighbours screen shows it as "+N% boost".
- **Auto-dana** per RT: Off, or keep **3**, **6** or **12** banked. Each month it tops the bank back up, and never spends the kas below **Rp 5jt** (with inflation). The screen shows about what it costs a month.
- The Neighbours screen lists what each RT still needs for its next star, as the same checklist the player's own RT uses.
- **Two ways to run a neighbour.** AI-run (the default): you fund it, as above. **Player-run:** take it over for **3** Orang Dalam (a word with Pak RW). Only RTs in your own RW. Its buildings join yours, its warga become your residents, you pay their upkeep, and banked Dana comes back to the kas. Its lots become yours to build on with the normal Build flow. Its stars use the same checklist, read from its own lots: the buildings there, your Sabar, and a share of your residents in proportion to the beds it holds. Its stars, ranking and combos stay with the RT. **Hand it back** any time, free: every building in its lots goes back to the AI as it stands (unfinished ones finish), with as many warga as its houses hold. Staff stay with you. Stars never drop. Its Auto-dana comes back on at the level it had before the takeover; with Auto-dana off, it waits for Dana, and the hand-back toast says so. An RT whose lot is full says so on its row.
- **Combos count across RTs.** For an AI RT's combos goal, the count is the most combos any RT has found, the player's included. Residents, wins and Sabar stay per RT. The player's own RT still counts only its own combos. Without this, a Rajin RT finds only one combo and never passes 1★.
- Ketua RT traits:
  - Rajin builds every **2** months and earns **x1.2**.
  - Hobi Wacana skips one build in three to hold a wacana.
  - Jarang Muncul builds on time but sends **2x** Surat Pengantar.

### Stage 1: RT

#### 0★ Pak RT (start)

- Open: Rumah, Jalan Setapak, Kantor RT, Warung Sembako, Pos Ronda, Rumah Makan. Wifi at **8** residents.
- **Roads:** a building works only once a Jalan Setapak joins it to the Kantor RT. Fields, ponds, paths, decor and the Menara Wifi need none: a mast needs power, not visitors.
- **Problem unlocks** open when their trouble first shows up, with a notice saying why: Selokan after the first banjir; Gudang Material and Kebun Sayur when **3** warga have gone **6** months without work; Fotokopi when a permit queue forms. Pos Satpam moves to the first preman when preman exist.
- **Rumah** levels up like any building: level 2 adds a teras and houses **4**, level 3 is a rumah tingkat and houses **5** (level 1 houses **3**), and needs RT 2★. Rumah is the fast house: no permit, no build time, and it draws new warga. Denser housing (Kos-kosan, Kontrakan) houses more per tile and pays rent (`decisions/playtest-sk2.md`). An upgrade costs the build price times the current level, so a house grows without a new lot.
- **Goal for 1★:** **10** residents and **1** combo found.

#### 1★ RT Rintisan

- Unlocks IndoApril, BetaMart, Kos-kosan, Barbershop, Pohon Rindang, Sawah and Pos Satpam. Kantor RT can reach level 2. Harga cabai starts.
- Their gate moves from a population count to this star.
- Reward: **+1** Orang Dalam.
- **Goal for 2★:** **25** residents, **1** ranking win and **2** combos.

#### 2★ RT Berkembang

- Unlocks Lapangan, Bank Sampah, Bengkel, PAUD, Balai-balai Bambu and Kandang Ayam. Kantor RT can reach level 3.
- The scenery edge thins, so the neighbours' roofs show.
- **Goal for 3★:** **55** residents, **2** wins in a row, **3** combos and Sabar of at least **65**.

#### 3★ RT Teladan

- Unlocks Apotek, Koperasi, Balai Warga, Lampu Jalan and Mural.
- The SK to RW arrives. Kontrakan, Kolam Lele and Patung Ikon open at RW. **Kontrakan** (2x2) houses **24** (level 2: **32**) and pays rent: the densest housing, at about 8 beds a tile against Rumah's 5.

#### New RT content

- **Kos-kosan:** a 1x2 row of rooms, houses **10** (level 2: **14**) and pays rent, costs **1** Sabar a month for the noise.
- **Lapangan:** a 2x3 field. Rent (sewa lapangan) earns **120rb** a month against its **100rb** upkeep, **+0.5** Popularitas a month. Doubles the Lomba Agustusan prizes, and is needed for Panjat Pinang.
- **Bank Sampah:** earns up to **Rp 40rb** a month.
- **Anak Kos** combo (Kos + Warung + Wifi): warung **x1.3**, **+1** Viral a month.
- **Panjat Pinang** combo (Lapangan + Pos Ronda): Agustus prize **+50%**.
- **Kali Bersih** combo (Bank Sampah + Selokan): banjir damage **20%** lower. The **80%** cap stays.
- **Rumah Makan** merges Gerobak Bakso, Warkop and Warteg as levels 1 to 3. **Warung Sembako** is the warung; Toko Kelontong is its level 3. Old saves keep the retired buildings working, and combos count them as the building they joined.
- **Decor** is five pieces, each with its own job: Pohon Rindang (+0.3 Popularitas a month), Balai-balai Bambu (shops within 2 tiles +6%), Lampu Jalan (shops within 2 tiles +6%), Mural (+1 Viral a month), Patung Ikon. Pot Bunga and Kolam Ikan Hias are cut; Taman Bermain and Air Mancur wait for the city act.
- **Brands.** A building gets a brand only when its real-world version is a chain. Minimarkets are IndoApril and BetaMart: different ones side by side make Rivalitas Abadi (**x1.4**, **-2** Popularitas), the same one within **2** tiles makes both earn **15%** less. Wifi towers carry a provider (Telkomkesel, M4, Indosatset, XXL, Smartfriend, By.Utang): two different providers within **2** tiles make **Perang Kuota** (**x1.3**, **+2** Viral, **-1** Popularitas a month). Rumah Makan, Apotek, Bengkel and Barbershop are franchises: each other outlet of the same brand adds **8%**, up to **24%**, and **5%** of their income goes up as royalty with the Setoran. The brand can be changed in the inspector, and any building can be renamed.

### Stage 2: RW

#### 0★ Pak RW (promotion)

- The map expands to 2 RTs: yours and Kampung Sebelah.
- Unlocks Balai RW, the Stempel resource and Dana allocation.
- **Goal for 1★:** fund Kampung Sebelah once, and keep the Stempel backlog under **5** for **6** weeks.

#### 1★ RW Rintisan

- Unlocks Posyandu, Portal and the Kader Posyandu job.
- **Goal for 2★:** Kampung Sebelah at 1★ or above, **1** win against RW Sebelah, and **2** RW combos.

#### 2★ RW Berkembang

- Unlocks Pasar Kaget, Gapura and the Calo job. The Musim Pindahan event starts.
- **Goal for 3★:**
  - Kampung Sebelah at 3★
  - **2** wins in a row
  - no debt for **24** weeks

#### 3★ RW Teladan

- The SK to Kelurahan arrives.

#### New RW content

- **Stempel:** refills **3** a month. Every Surat Pengantar from an RT needs one. Each unstamped letter drains **0.5** Sabar a month. The player is now the permit queue. At the Kelurahan only the RTs in the player's own RW send letters to the player; the other RWs stamp their own.
- **Dana:** the new verb. You fund each RT, and it builds and levels only when funded. More banked Dana builds faster, and Auto-dana keeps it funded (see AI neighbours).
- **Balai RW:** **+1** Stempel a month, **2** PNS slots.
- **Posyandu:** **+1** Sabar a month to neighbouring RTs.
- **Pasar Kaget:** **x3** income one month in four. Spawns **2** tukang parkir.
- **Gapura:** **+5** Viral in August and nothing otherwise. Repainting costs Rp every August.
- **Portal:** **+1** Sabar a month, ojol income **-30%**. Riders stop at the barrier.
- **Jalan Ditutup** combo (Pasar Kaget + Portal): market **x1.5**, ojol income **0** that month, **-1** Sabar.
- **Grup Chat Warga** combo (two neighbouring RTs with the same trait): **+2** Viral, **-1** Sabar a month. With one AI RT at the RW, it first happens at the Kelurahan, between RW 2's two RTs.
- **Pos Siaga** combo (Posyandu + Portal): **+1** Sabar and **+1** Viral a month. It gives a 1★ player a second RW combo for the 2★ goal.
- **Agustusan Akbar** combo (Gapura + Lapangan): 17 Agustus pays **x2**.
- **Rivalitas Abadi** now also runs between your RT and Kampung Sebelah.
- **Kader Posyandu** job: **+0.5** Sabar a month, unpaid. Output falls **20%** a year unless you pay an Apresiasi of **Rp 300rb**.
- **Calo** job: turns **Rp 200rb** into **1** Stempel, **+0.1** Orang Dalam. **5%** a month chance of a scandal for **-6** Sabar.
- **Kerja Bakti** event: attendance equals Sabar. Selokan works **20%** better for **6** months.
- **Musim Pindahan** event: Surat Pengantar triple for **2** months.
- **Pendataan Warga** event: the reported population is off by **10%**, and the gap moves the ranking.

### Stage 3: Kelurahan

Kelurahan is dense and shop-heavy. The Desa path was cut (Hari, 2026-10-31).

#### 0★ Pak Lurah

- Kampung Sebelah joins your RW as yours, and RW 2 (two AI RTs) appears. Stempel letters stop reaching you: your RW has no AI RT left, and RW 2 stamps its own.
- Unlocks Kantor Kelurahan and Anggaran.
- **Goal for 1★:** RW 2 at 1★ or above (an RW is as good as its weaker RT), serapan of at least **80%** for one year, and the player's own kampung at **50** residents and Popularitas **50**.

#### 1★

- Unlocks Puskesmas Pembantu and the Honorer job. Kelurahan gets Pasar.
- **Goal for 2★:** RW 2 at 2★ or above, **1** Piala Kelurahan win, a clean Tim Audit, and the player's own kampung at **120** residents and Popularitas **45**.

#### 2★

- Unlocks Terminal and Taman. Terminal is the one 3x3 building, the Kelurahan landmark: **Rp 25jt**, and shops within **3** tiles earn **20%** more. A 3x3 never fits a 2-tile seam, so it stands inside the player's RT lots.
- **Goal for 3★:** **3** Piala wins, RW 2 at 3★, and the player's own kampung at **200** residents and Popularitas **35**. A bigger kampung expects more, so holding Popularitas while growing is the work of this stage.

#### 3★ Lurah Teladan

- Play continues. Kecamatan comes later. The credits roll at Sidang Emas 2045, the end of the whole run, not here (Hari, 2026-10-31).

#### New Kelurahan content

- **Anggaran:** the new verb. A yearly budget arrives each January. Each unspent % cuts next year's budget by the same %. December brings a forced Serapan rush.
- **Kantor Kelurahan:** **4** PNS slots.
- **Puskesmas Pembantu:** **+2** Sabar a month.
- **Aspal Ulang:** costs Rp, adds **0** value, counts as spent.
- **Studi Banding:** costs **Rp 2jt**, returns one random wacana.
- **Macet Abadi** combo (Pasar + Terminal + Parkir): income **x1.6**, **-3** Sabar.
- **Perang Tarif** combo (Terminal + any Ojol job): both earn **x1.3**, **-2** Sabar.
- **Spot Instagramable** combo (Taman + Influencer): **+3** Viral a month, park upkeep doubles.
- **Honorer** job: does PNS work for half the pay. After **5** years, **20%** a year chance of becoming PNS.
- **Tim Audit** event: comes every March once the Kelurahan has 1★, so the 2★ goal never waits on luck. Each wacana with no receipt costs **2** Sabar; with none missing (or a paid rapi-rapi) the audit is clean.
- **Lomba Kelurahan** event: paint spending raises the score for one month.
- **Kunjungan** event: one month warning before a visit.

### Stage 4: Kecamatan

The first Act 2 stage (Pak Camat). Built in `docs/plans/kecamatan-slice.md`; numbers below are the shipped, bot-tuned ones. The player's Kelurahan stays the live tile map. The other three Kelurahan (Mawar, Melati, Kenanga) are modelled: each has stars, a pinjol share and an Aman value, and shows as a block around the map. Tapping a block opens its card.

#### 0★ Pak Camat

- Unlocks Kantor Kecamatan, Pos Satpol PP, Koperasi Simpan Pinjam and Balai Latihan Kerja. Pinjol and judol start here. Act 1 stages never run them.
- **Goal for 1★:** build the Kantor Kecamatan, every Kelurahan at 1★, pinjol under **25%** of households, and the player's own kampung at **250** residents.

#### 1★

- Unlocks Baliho and Taman Kota.
- **Goal for 2★:** every Kelurahan at 2★, **1** yearly ranking win, Aman **60+** across the Kecamatan for **24** weeks, Popularitas **35**.

#### 2★

- **Goal for 3★:** every Kelurahan at 3★, **3** yearly ranking wins, pinjol under **10%**, Aman **65+** with no razia in the last **48** weeks.

#### 3★ Camat Teladan

- The SK to Pj. Wali Kota arrives. That stage is not built; play continues. Rival: Kecamatan Sebelah.

#### How the stage works

- **Districts:** each modelled Kelurahan earns a star after **90**, **200** and **340** weeks of progress. Progress a week is **1.2** for a Rajin district, **1.0** for Hobi and **0.8** for Jarang. The slowest district sets the 3★ time: 340 / 0.8 = **425** weeks, about **57** min at 1x.
- **Pinjol:** households are groups of 3 residents. A household can borrow (**3%** a week) when most members have been idle **24+** weeks, or when it is unfed. In debt it counts as half unfed. After **24** weeks in debt the debt collector costs **5** Aman for **12** weeks. Meter: share of households in debt.
- **Judol:** each **10** Viral above **20** adds **1%** a week to start. A judol household loses **30%** of its income and borrows at **2x**.
- **Responses:** Razia Satpol PP (**1** Orang Inside, Aman +8 for 8 weeks, Popularitas -3, half the cases move to the next Kelurahan: the problem is somewhere else, which is the joke). Literasi Keuangan (Realisasi, Rp 3jt, lands after 8 weeks, new cases -50% for 48 weeks). Spanduk Anti Judol (Wacana: Laporan up, nothing real). Koperasi Simpan Pinjam cuts new cases 25% each, two count. Balai Latihan Kerja retrains one idle warga a week.
- **Crowd and expectations:** in the Kecamatan each resident weighs **0.1** Aman (0.3 elsewhere) and drains **0.6x** the Popularitas. 250 residents are a goal here, not a crisis (decisions/kecamatan-balance-1.md and -2.md).
- **Tier-win goals** (RW, Kelurahan, Kecamatan) count only yearly rankings won in that stage. The ranking runs every 12 weeks, so every fourth one counts.

#### New Kecamatan content

- **Buildings (6):** Kantor Kecamatan (Rp 30jt, **4** PNS and **2** Honorer slots), Pos Satpol PP (Rp 8jt, **+4** Aman), Koperasi Simpan Pinjam (Rp 10jt), Balai Latihan Kerja (Rp 9jt), Baliho (Rp 4jt, ad income, **+1** Viral a week, speeds judol), Taman Kota (Rp 12jt, **+2** Popularitas a week, shops within 3 tiles **+8%**).
- **Combos (4):** Modal Usaha (Koperasi Simpan Pinjam + Balai Latihan Kerja), Razia Pasar (Pos Satpol PP + Pasar), Iklan Bertarget (Baliho + Wifi: income and judol both up), Kampung Tertib (Pos Satpol PP + Lampu Jalan).
- **Events (6):** SMS Pinjol, Iklan Judol, Penagih di Gang, Razia Pindah, Utang Viral, Tim Literasi.
- **Staff:** a Satpol PP role.

## 3. Pacing targets

Approved by Hari, 2026-10-27. Times are real seconds at 1x. One month is 8s (`MONTH_MS`), so 15 min is about 112 months. Since 2026-10-31 the 8s tick is one week, so a month is 32s and a year 6.4 min. Counts below are weeks (ticks), so wall time is unchanged; see `decisions/weekly-calendar.md`.
Measure with the test bot in `tests/balance.test.ts` (10 seeds, idle and builder). A bot never hesitates, so its times are lower bounds. A bot miss is a real miss. A bot pass is unproven.

### Targets

| # | Target | Why | Status 2026-10-27 |
| --- | --- | --- | --- |
| 1 | First house built within 30s of New Game | Kairosoft opens on a build. Idle time here loses the player. | Estimate: about 25 to 35s (6 taps, 57 tutorial words). Close to the line. Not timed. |
| 2 | First resident within 10s of the house | The first build must visibly pay off. | Pass: month 1 (8s) |
| 3 | First popup between 45s and 90s | Let the player learn the map first. | Pass: 48 to 56s |
| 4 | 1★ within 2 min, 2★ within 5 min, 3★ in 9 to 12 min for the builder bot (12 min is the intended pace, not a ceiling; Hari 2026-10-31) | A goal done, a new one in view. | Pass in 10 of 10 bot seeds (1★ week 2, 2★ weeks 33 to 40, 3★ weeks 77 to 90). Ceiling enforced by `tests/balance.test.ts`; the floor reads from the scorecard star table. |
| 5 | Something new (resident, event, combo or unlock) at least every 30s | Replaces "something new every 1-2 in-game minutes". | Pass by bot, not asserted. Combos alone can go 30 months apart (seed 8), residents and events fill the gap. |
| 6 | At most 2 popups per minute, never two within 20s | Back-to-back cards read as spam. | Pass: random popups keep 3 months clear of any other event (`EVENT_CLEAR`). Asserted in `tests/balance.test.ts`. |
| 7 | Tutorial tips at least 60s apart | One lesson at a time. | Pass (`GAP_MS`) |
| 8 | No debt or soft-lock in year 1 | Bad choices slow you down. They never end the game. | Pass (balance test) |
| 9 | Year-1 cash never below 0 for idle or builder bots | Same rule, measured as a number. | Pass (balance test) |
| 10 | Each star unlocks something the player can use within 30s | Stars must feel like rewards, not counters. | Pass by design (the unlocks per star in section 2). Affordability at that moment not measured. |

### Sources

- Dungeon Village star gates tie to popularity, income and events held: [Kairosoft wiki](https://kairosoft.fandom.com/wiki/Dungeon_Village).
- Pocket Academy reviewers cite a weak tutorial, debt traps and no fast speed: [Pocket Gamer](https://www.pocketgamer.com/googleplay/net.kairosoft.android.school2_en).
- FTUE: get players playing fast, end each session with a goal done and a new one in view: [GameAnalytics](https://gameanalytics.com/?p=4403), [Adinmo](https://adinmo.com/first-time-user-experience-why-it-matters-and-how-to-get-it-right/page/6).
- The published sources give no numbers. The numeric targets are first-principles proposals and may be tuned. Log any change in `decisions/`.

### Known caveats

- Popups auto-pause the game, so wall time per popup is longer than the sim suggests.
- The 20s popup gap is a taste call. Loosen it if testers prefer 30s.

### Open work (not shipped here)

- Targets 4 and 6 are fixed and tested. The earlier seed 2 stall came from an unlucky event order, not a balance gap.
- A human-timed run for targets 1 and 10, if the estimates matter.

## 4. Economy and balance

How the numbers work, gathered from every stage. The numbers themselves live in `src/data/` and are tuned there. The tests in `tests/balance.test.ts` guard them.

- **Perut:** a household is 3 residents. A Warung Sembako feeds 4, 7 or 10 households at levels 1 to 3 (an old Toko Kelontong feeds 10). Harga Sembako (the cabai event) cuts that by 25% while it lasts. Each unfed household costs **0.1** Popularitas a month.
- **Kerja:** the share of residents in work, plus programs.
- **Aman:** **70**, less **0.3** per resident above 15, **2** per resident idle 6 months or more and **4** per preman; plus **3** per Lampu Jalan and **2** per Pos Ronda, plus programs.
- **Preman:** a resident idle **12** months, while Aman is under **60**, has a **5%** chance a month to turn (at most **15%** of residents). Each costs **0.2** Popularitas a month and takes **10%** of one shop's income as uang keamanan (up to **30%** a shop). Pos Satpam opens with the first preman; while a preman waits, Satpam posts are kept for him, and taking one turns him into the guard. Any job the player gives him does too.
- **Tukang parkir liar:** the first shop always draws one; after that each new shop has a **30%** chance, never more than **4** on the map, and never beside the Kantor. Stage buildings that spawn them (Pasar Kaget) still do, up to the cap. Each pays a little retribusi and costs Popularitas. He cannot be demolished, but he can be **tertibkan** from his panel: free with a Hansip on duty, otherwise **1** Orang Dalam. A cleared one has a **30%** chance to return to the same shop **3** to **6** months later.
- **Lomba Agustusan** (the big yearly event, from year 2): the panitia forms in **May** with a card that opens its panel (Menu, 17 Agustus). Until the day the player picks up to **3** contests (paid when picked, refunded if dropped), a stage and a ketua panitia from the staff.
  - Contests: **Panjat Pinang** (needs a Lapangan; a timing mini-game: tap while the marker is in the green band, 3 grips before 3 slips), **Balap Karung** (tap 30 times in 5 seconds), **Makan Kerupuk** and **Tarik Tambang** (decided by the odds, shown first).
  - Stage: none, Terpal (×1.2 turnout), Panggung (×1.45), Dangdut (×1.75, Inem headlines and her Panggung 17 Agustus gig completes).
  - Staff stats: the ketua's **Rajin** widens the grip band; **Gaul** cuts the taps and lifts the odds. Kampung meters: **Aman** lifts the odds, and below **40** the day turns ricuh (Popularitas −5). **Popularitas** sets turnout (0.5 at 0, 1.5 at 100).
  - On **17 Agustus** time stops for a full-screen day: one contest at a time, then the prizes. It cannot be closed in one tap. Prizes per win are scaled by turnout and the 17 Agustus combos (Lapangan ×2 and the rest). Any win brings a crowd: income **×1.2** for 2 months. Winning every contest (2 or more) puts a trophy on the Kantor RT for a year. No contests picked: Popularitas −8.
  - Random events keep 3 months clear of the day, as they did of the old one-tap 17 Agustus event, which this replaces.
  - **Look and sound**, all made in code (`src/render/agustus.ts`, `src/audio.ts`): in July and August from year 2, red-and-white bunting runs from the Kantor RT to its nearest buildings, with many-coloured umbul-umbul in front. The day opens on a confetti banner and a drumband fanfare (snare roll, glockenspiel, pianika). The pole is a greased pinang trunk with the prizes on its hoop; a win slides a whistle up into a cheer, a slip slides it down into a thud. Every sack-race hop thumps, the kerupuk crunches, a lost contest gets a koplo sting, and the prizes get an angklung call (the drumband again for a clean sweep). Tunes are original; Indonesia Raya is never used, and the flag itself is never drawn (`decisions/17an-assets.md`).
- **Inspections** (from month 15, then 10 months after each visit): a warning event 2 months ahead, then the visit scores 4 criteria of **25** points each. **70** pays 2 Orang Dalam and +5 Popularitas, **45** pays 1 Orang Dalam, less costs 4 Popularitas. Each warning offers a free choice and two shortcuts (Rupiah or 1 Orang Dalam) that add points for that visit only; a pass carried by shortcuts gets its own line. The first visit is Kampung Bersih; after that any other team, never the same twice in a row:
  - Kampung Bersih (Kecamatan): drainage, Popularitas, tertib (no mangkrak or damaged buildings), parkir liar.
  - Ketertiban (Satpol PP): parkir liar, tertib, Aman, Popularitas.
  - Kampung Sehat (Puskesmas): drainage, Perut, health posts (Apotek, Posyandu, Puskesmas Pembantu), Popularitas.
  - Kampung Digital (Diskominfo): WiFi, Viral, tertib, Popularitas.
- **Wacana or Realisasi:** each policy has a real version (Wifi Gratis di Balai, Kerja Bakti Rutin, Biopori Massal, Pelatihan UMKM, Bansos Sembako). It costs Rp 1 to 3 juta, lands after 1 to 3 months and moves a meter for a time (Biopori for good). Announcing fills the Laporan as well as doing does; only doing moves Sejahtera.
- **Popularitas soft cap:** above **80**, gains shrink toward nothing at 100, so a full kampung settles around 90 instead of sitting at the cap. Each employed resident gives **0.04** (was 0.08), each resident expects **0.14** (was 0.1), and a Satpam gives **0.5** (was 1).
- **Staff** (`src/data/staff.ts`): the people the player manages, as Kairosoft's staff are; warga still pick their own jobs. Inem is staff number 1 (the first Asisten at the Kantor desk, see the desk queue below) and never leaves. Slots: 1 at the start, 3 at RT 1★, 4 at RT 3★, 6 at RW, 8 at Kelurahan, never more than **10**.
  - **Desk queue** (prototype, 2026-10-31, `decisions/desk-queue.md`): every permit is a pile of folders (berkas), one per permit month, and the Kantor clears them in the order buildings were placed. Each Asisten clears **0.85** folders a month per point of output, so Inem at level 1 clears about **1**; the Kantor never clears fewer than **0.5**. Each building still costs **1** Popularitas for every month it waits. More Asisten clear the queue sooner, and the Asisten role can be posted from RT 1★. The map badge shows the months to go, the Kantor carries a pile of folders while the queue has work, and once the queue is **3** months deep with a free slot, the goal strip says to post a lowongan for an Asisten. Rumah need no permit, so the first house is still instant.
  - **Stats** (`decisions/staff-stats.md`): Rajin, Lobi, Jujur, Gaul (1 to 99), each with its own icon and one meaning everywhere: Rajin is how much gets done, Lobi how smoothly things go through the people above, Jujur how much leaks, Gaul how liked. Output = level x the role's work stat / 50 x trait.
  - **Roles**, each with a work stat and a risk stat; every stat is the work stat of two roles and the risk stat of two (playtest 2026-11-01: Rajin was doing almost everything): Asisten (Lobi: the desk queue; Rajin: a folder is misfiled, −2 Popularitas), Sekretaris (Lobi: Orang Inside; Jujur: a small scandal, −3), Tukang Tagih Iuran (Gaul: talks warga into paying, up to +50% iuran; Jujur: skims Rp 150rb), Admin Grup WA (Gaul: Viral; Lobi: the group gets reported, −3), Hansip (Rajin: Aman +2 per level, finds a preman work; Gaul: a scuffle, −2), Petugas PU (Rajin: repairs; Lobi: no materials from the supplier, Rp 250rb), Bendahara (Jujur: upkeep down; Rajin: the receipts go missing, Rp 300rb), Supir (Jujur: no detours to his cousin's warung, crews arrive sooner; Gaul: clips a gerobak, −1).
  - **Mishaps:** below **60** in the risk stat, a mishap can strike any week, at 8% x (60 − stat) / 60: Jujur 30 is about one every half year. The notice names the person, the stat and its value ("Bu Sri (Jujur 25): menyunat iuran").
  - **Shown in numbers:** every staff card says what its work stat buys ("Lobi 60 → 1 berkas per minggu"); the detail view labels the two stats a job uses (work and risk, each with its effect) and greys the other two; an applicant shows what they would do in the posted role and their risk; trait chips name the stats a trait bends.
  - **Who do you send?** Some events ask you to send one of your staff. The card lists the best three for the stat with their odds (base + (stat − 50) x 1.2%, from 5% to 95%), and a success teaches them a point of it: a call from the Kecamatan (Lobi: stamps 4 folders), warga at the gate (Gaul), a hibah in cash (Jujur), leaking roofs (Rajin), and the Tim Audit (Lobi: a clean audit, or receipts cost double).
  - **Lowongan:** a Grup WA posting goes out through your Admin Grup WA, whose Gaul moves up to 20 points of the odds from 2★ to 3★ applicants (or 10 the other way).
  - **Rarity:** stars set only the stat total and salary: 2★ 120, 3★ 160, 4★ 210 (Act 1 tops out here), 5★ 270 (Act 2), 6★ 340 (Act 3). No paid pulls.
  - **Lowongan:** one posting at a time. Grup WA RT is free, takes 2 months, and brings your own longest-idle warga (60/35/5% for 2/3/4★, 15% chance of a Titipan); Online costs Rp 500k, takes 1 month and brings outsiders at 30/50/20%. 3 to 5 applicants arrive as a card with a button to Staff, and wait there until you hire one or cancel; the Menu shows how many wait. The requirement lines are flavour; every applicant is an adult.
  - **Traits:** Titipan, Jam Karet, Rajin Lembur, Healing Mulu, Si Paling Grup WA, Mantan Preman, Fresh Graduate, Pensiunan PNS, Multitalenta, Baperan. **Specials** (4★, one each, 30% of 4★ Online applicants for their role) are types, never one real person: Pak Breaking, Mbak Gosip, Om Motivasi, Bro Kripto, Bu Sinetron, Mas Konten, Pak Purna, and six 90s TV and radio types: Bang Lawak (a campus-radio comic), Om Lalu Lintas (a radio traffic reporter), Bu Juru Ketik (a typewriter typist), Pak Kuis (a quiz-show host), Mbak Senam Pagi (a morning-aerobics instructor) and Bang Rental PS (a games-rental repairman). Every special has a portrait drawn in code (`src/render/portraits.ts`), shown on their card and as an applicant; types only, never a real person or anyone else's character.
  - **Managing:** levels at 6, 18, 36 and 60 months; each asks for a 15% raise (refused: 10% a month to be poached, a Baperan leaves at once). Every level-up adds **2** to the work stat. Bimtek: pick a course for any stat, +5, a week away; Rp 2jt, or Rp 3jt for the anti-corruption course. Pesangon: 2 months' salary. **Mutasi:** a 3★ at level 3 becomes Ketua RT of a neighbour, which takes their habit (Rajin, Hobi Wacana or Jarang Muncul), and the slot frees.
  - **Inem's dream:** gigs as optional sub-goals that never gate stars: Panggung 17 Agustus (Lapangan, Popularitas 50 in August), Hajatan circuit (RW, Viral 30), Lomba Dangdut Kecamatan (a Piala Kelurahan win), then the city audition and the stage at Sidang Emas 2045. Each raises her level. Her wage is Rp 75k a month.
  - **Faces** (`decisions/staff-requests.md`): every staff member has a portrait. Specials and Inem have their own; generic hires get one painted from their staff id, with the outfit of their job (Hansip in green with a beret, Petugas PU in an orange vest and helmet, Bendahara in batik, and so on).
  - **Urusan Pribadi:** from level 2, each staff member brings a personal request about every **24** weeks, at most **2** open at once, each with a deadline. They ask for money (a loan or a payment), time (cuti), a Bimtek course, experience (send-events, ketua panitia) or a resource, in their own voice: "Pak, saya mau ijin cuti 3 minggu. Mertua nginep nggak pulang-pulang, makannya banyak lagi. Stres, Pak." Each line is 20 words at most (UI.md rule 13); a longer reason waits behind a tap on the portrait. Yes gives **+1** Akrab (up to **3** hearts, **+3** to the work stat each, a quirk upgrade or perk at 3); no takes one away and raises the poaching risk. Loans for side businesses (Martabak Matcha, lele bioflok, jastip Korea) come back with interest, flop, or open a small shop, rolled on the borrower's Jujur. Costs scale with income. Requests never gate stars.
  - **Quest chains:** each special has a three-step chain like Inem's, several needing another special (Pak Purna's memoir needs Bu Juru Ketik to type it; her typewriter needs Bang Rental PS). The chains and payoffs are in `decisions/staff-requests.md`.

- **Resources:** every resource has an icon and a colour. Names are translated, see `decisions/resource-names.md`. Orang Dalam is "Orang Inside" in EN on purpose.
- **Growth gates:** stars gate content. Residents, wins and combos set the star goals. Stars never drop.
- **Kas:** Kas RT becomes Kas RW, then Kas Kelurahan. AI areas pay iuran into it.
- **Dana (RW):** you fund each neighbouring RT. An RT only builds and levels when funded. An unfunded RT visibly stalls.
- **Stempel (RW):** refills 3 a month. Every Surat Pengantar needs one. Each unstamped letter drains 0.5 Sabar a month. At the Kelurahan only the player's own RW sends letters to the player.
- **Anggaran (Kelurahan):** a yearly budget arrives each January. Each unspent % cuts next year's budget by the same %. December brings a forced Serapan rush.
- **Yearly price banner:** from year 2 the year-end notice is a banner: "PERHATIAN: Biaya hidup naik {x}% tahun ini", with one reason a year from a bank that targets how prices behave, never a group of people ("Harga telur naik. Ayamnya belum diberi tahu."). The bank is in `decisions/staff-requests.md`.
- **Safety net:** no debt or soft-lock in year 1, and year-1 cash never below 0 for the idle and builder bots (targets 8 and 9).
- **Tuning:** the balance autoplayer tunes star thresholds. How to read its results is in section 3.
- **Time:** one tick is 8s at 1x (`MONTH_MS`) and is one week. A month is 4 weeks (32s), a year 48 weeks (6.4 min). Speeds are pause, 1x and 2x. Done 2026-10-31 (`decisions/weekly-calendar.md`).
- **Rule:** any change to a number a target depends on gets a note in `decisions/`.

## 5. Tone and politics guardrails

### Satire

- Satire targets systems and bureaucracy.
- No real politicians, parties, ormas or officials. Preman are generic and never coded as any ormas.
- No ethnic, regional or religious jokes.
- Every joke is a mechanic that moves a number (see section 1).
- UI defaults to Bahasa Indonesia, with English as a Settings option. Players who saved a language keep it. Slang and proper names stay as they are in both languages (Sabar, Wacana, Warga, warung, ojol, Kampung Sebelah). Resource names are translated, see `decisions/resource-names.md`. Strings live in `src/i18n/`.

### Staying out of real politics

- The player never runs for office. Promotion is a performance review and an SK, the promotion letter. No votes, parties, coalitions or campaigns.
- Superiors stay faceless: Pusat, Tim Audit, Kelurahan Sebelah. No named places and no real agencies.
- Satire targets how a system behaves, never who introduced it or when. Musrenbang and Dana Desa are fine. Flagship programs, the capital move and named slogans are out.
- Swap test: if a joke would not work in any country's bureaucracy, or needs a headline to land, cut it. Example: "blusukan" is tied to one real person, so it is out.
- Indonesia Emas 2045 stays the only real reference.
- Brands are parodies of the name only, never a logo or brand colours, and only for chains (see the brands list in section 2). Indomaret and Alfamart are IndoApril and BetaMart. Chat apps stay generic ("Grup Chat Warga").

## 6. UI, art and tech rules

These are the design-level UI rules. Measurable checks are in [UI.md](UI.md). Art detail is in [ART.md](ART.md).

### Touch and layout

- Mobile-first, portrait, touch controls. Every number (tap size, text size, contrast, word limits) lives in [UI.md](UI.md), not here.
- Main screen is the console frame, after a 90s train-and-city builder (`src/ui/console.ts`, `src/ui/console.css`). It is kept to two slim rows on top and one dock below, so the map has the room. Top to bottom:
  - a time row: play/pause and speed (one size, side by side), the date, and the compact Indonesia Emas 2045 meter;
  - a money row: the five resources;
  - the map, full width. A goal pill floats over its top-left corner (one goal at a time, up to two lines, "Goal: reach 10 residents"; tap for every goal left with have and need), and a small satellite view over its top-right corner pans the map when tapped;
  - the month as a thin line along the top edge of the bottom bar;
  - a dock, icon over label: Build at its own width, then Warga, Staf and Menu sharing the rest. Staf has its own button because staff run the desk queue and the send-someone events (playtest 2026-11-01).
- Why this arrangement: time controls sit with the date, as in most city builders, and change speed without leaving the map. The resources get a row to themselves, so big numbers have room. The goal floats over the map, as quests do in mobile builders, so neither row wraps. Build and Warga are the panels used many times a minute, so they get their own buttons; the rest stay one tap away in Menu.
- Build, Warga and Staf live only in the dock (`ActionButton.dock`), so the Menu does not list them twice. The Combo book opens from a header button inside Build. Every other panel opens from the single Menu button, grouped as Kampung, Records and Game. Settings and How to play live under Game. A new panel registers an `ActionButton` with a `group` in the Menu. Don't add other main-screen buttons.
- Notices are toasts, not a band: the latest one floats over the bottom of the map for 3 seconds, then fades. Tap it to open the Log. Every notice also stays in the Log (Menu > Log), so a missed toast is never lost. Important messages still use the pause-and-tap modal.
- The satellite view hides while a building is being placed. A small square under it folds it away to a button in its corner, and back; the choice is saved in settings. The square is drawn 28px inside a 48px tap area.
- While time stands still with the map in view (the player's pause, or build mode), a pixel **JEDA / PAUSED** pill shows near the bottom of the map. It hides under a toast. Ambient motion stops while paused (scenery, walkers, idle buildings, weather); feedback for what the player does (the ghost, bursts, coins) keeps moving.
- The goal pill's line, with the "Goal:" label ("Target:" in Indonesian), in order: the first house; a combo, from month 30 if none is found, or as soon as a combo is all the next star still needs (it leads over beds); waiting on a build; beds; and when beds are free but nobody comes (residents at the attraction limit), the building that draws the most residents for its price; otherwise the next resident step.
- Warnings that explain a fall, as toasts: when the 2045 meter drops **10** points or more in a month, the toast names the meter that fell most, and the shut warung if Perut fell. The first month Popularitas falls by **1** or more (from month 6, after the opener), one toast names the biggest cause (permit queue, expectations, broke, hunger or preman, or buildings that drain it). It shows once per game.
- A building waiting for a permit leads its panel with the Orang Dalam button, above the fold.
- The map shows each phase of a building differently. Waiting for a permit: only the staked plot (stakes and string) under the permit sign; nothing is built yet. Being built: the half-made building in bamboo scaffolding with a tower crane over it. Mangkrak: the scaffolding without the crane.
- Combo pop-ups show the buildings that made the combo, at their levels, under the title.
- Picking a building drops nothing on the map: every free spot glows as a faint diamond, and the bar says to tap one. The first tap on a free tile puts the ghost there, with a pixel arrow over it and Cancel, Rotate and Place under it (Rotate turns the ghost, free, and the building keeps that facing; paths have no Rotate); a finger or mouse on the ghost drags it (a hovering mouse does not move it, or the Place buttons would slide away from the cursor). If no free spot is in view, the map pans to the best one (beside a connected road, nearest the middle of the view). Moving a placed building starts from where it stands.
- Build cards show how many of each the player owns. Buildings not yet seen carry an animated pixel NEW tag on the card, its tab and the dock's Build button. A card's tag stays until that card has been at least half on screen for **2s**, or has been tapped; opening the sheet is not seeing it, since one star can unlock several things at once.
- Light and Dark share one layout: every size, gap and position is the same, and only colours change. An e2e test compares the boxes in both themes.
- On short phones (640px tall or less) the satellite view drops out and the goal pill spans the map's width.
- Sheets, pop-ups, tips and the tutorial follow the theme too, so an open panel matches the frame behind it (see Themes below). The home screen keeps its dark look over the map in both themes.
- Clean pixel UI: 1px rules, square corners, dark green (`#2f6b45`) for primary actions. No drop shadows in the bars. No cluttered Windows-XP-style panels.
- The rules in [UI.md](UI.md) apply to the frame, with rule 1's exception for the slim top rows and the goal pill (28px controls).
- The dev-only `mockup.html` (also at `/mockup.html` on the live site) is the reference render, with a build palette the game doesn't have. It is not linked from the game.
- Map art follows [ART.md](ART.md): palette, ink, shading, lighting and motion rules.

### Art style

The artist's restyle is the reference ([ART.md](ART.md) has the full rules). New art must match it.

- Warm storybook palette: terracotta, mustard, teal, cream, olive. Keys live in `PALETTE`.
- 1px dark-brown ink (`#2a1810`) round every silhouette and face edge. Never pure black.
- Flat two-tone cel shading, light from the top left. No dithering or noise on sprites or near ground. Distant scenery (haze, hill edge, volcanoes, clouds) blends through an ordered dither (ART.md).
- The land behind the kampung rolls into lit hills with a tile grid; twin volcanoes and drifting clouds stand behind them (ART.md).
- Straight isometric lines on a 32x16 tile, scaled by whole numbers only.
- Flat ground art (selokan, jalan) sets `bare` and draws its own edges so neighbours join.
- Never overwrite the artist's sprites. Add new ones beside them.

### Feedback

- The feedback ladder is rule 11 in [UI.md](UI.md).
- Ambient life (walkers, idle loops) follows reduce motion. Particles, coins, pulse and night tint follow effects.
- Canvas text (pops, badges) draws above the night tint.
- Haptics toggle in settings.

### Accessibility

- Icon, colour and label rules are rule 6 in [UI.md](UI.md).

### Tech

- Vite + TypeScript + Canvas, no framework.
- Simulation logic is pure and separate from rendering, with unit tests.
- Buildings, combos, jobs and events live in data files under `src/data/`.
- Placeholder pixel sprites are generated in code. No third-party game assets or names.
- Save to localStorage inside try/catch. The game runs without storage.
- PWA ships an install button and a forced update: a waiting version takes the whole home screen with one button, Perbarui sekarang (save, then reload). During play it never interrupts: the Menu button carries a dot and Menu lists a Perbarui tile. Icons and the manifest follow Mono Dark; the page theme-color follows the theme.

### Themes

Settings > Theme picks the colours of the frame and of every sheet and pop-up. Both themes share the same layout. Sheets and pop-ups take the same tokens (`src/ui/console.css`), with square corners and a 2px ink rule in Light.

- **Light** (default): cream `#f3eed6` surfaces, `#e6dfbf` for the ticker, ink `#2a1810` text and rules, muted `#5e4e3a`. Resource numbers and warnings use ink-dark tones on cream: Rupiah `#1d6b35`, Sabar `#1f57a8`, Orang Dalam `#7a4f00`, Viral `#a52a66`, full housing `#8a4b00`, missing and warning text `#9b1c1c`.
- **Dark** (Mono Dark): background `#0b0b0c`, surface `#18181b`, text `#f4f4f5`, muted `#a1a1aa`, rules `#52525b`. Resource numbers keep their bright colours.
- Both: dark green `#2f6b45` with cream text for primary actions. High contrast brightens muted text and rules in either theme.
- The browser theme-color follows the theme: `#f3eed6` light, `#0b0b0c` dark. The home screen keeps its dark backdrop. The PWA icon and manifest stay Mono Dark.
- UI chrome stays out of game colour: colour is for game meaning (resources, map).
- Icons: full-colour ART.md palette pixel glyph (house, sun, tree) on near-black. Hari lifted the monochrome rule for the icon only (2026-10-26).
- Numbers never use the pixel font (its 5 reads as an S). The pixel font is for labels, titles and primary buttons.

### Legibility and testing

- Body text uses Atkinson Hyperlegible. Pixelify Sans (patched as Pak Pixel by scripts/patch-pixel-font.py, so f is not a capital F) is for titles and primary buttons only. Pixelify draws 5 like S/8, so never use it for numbers.
- Text wraps and panels scroll (UI.md rule 5).
- The map is isometric. Tile diamonds are at least 32px tall. Smaller screens pan the map instead of shrinking it.
- A tap on a building's body picks that building, even where it overlaps the tile behind.
- Disabled buttons use a dashed border and muted text, with no opacity fade.
- `npm run e2e` runs the legibility scan. How the UI.md rules are checked is in [UI.md](UI.md).

## 7. Build order

1. RT stars and late-game content (Kos-kosan, Lapangan, Bank Sampah, 3 combos). Fixes the dead zone after 14 residents.
2. Frame-rate spike for the Kelurahan map (done).
3. RW: map growth, AI RTs, Stempel, Dana, RW content.
4. Kelurahan.
5. Playtest, then decide on Kecamatan and above.

Status 2026-10-27: the map engine, RT stars, RW and Kelurahan have shipped. Pick the next stage work in the project chat.

## 8. Design review checklist

Approved by Hari, 2026-10-31. The baseline agents use to judge mechanics, pacing and progression. Each item is a question, why it matters, what Kairosoft does, what good and bad look like, the evidence and a pass bar. UI/UX and testing get their own checklists. See `decisions/design-review-checklist.md`.

### How it works

- One review = one scorecard. Each item gets **Pass**, **Fail** or **Unknown**, with a link to the evidence.
- Each item is judged twice: against the Kairosoft pattern, and against Pak Pejabat's own goal (satire, Laporan vs Sejahtera). A gap from Kairosoft is fine if our goal explains it.
- Evidence tiers. Use the lowest tier that answers.
  - **T1 Sim bot:** headless runs in `tests/`, many seeds, several strategies.
  - **T2 Agent run:** Playwright drives the real app and logs what is on screen.
  - **T3 Human:** Hari plays a fixed 15-min script and answers 3 questions. Only for feel.
- Most T1 items need one new tool: a **timeline log** from the sim. One line per thing that happens (resident, event, combo, unlock, star, goal line shown and met, cash, meters, popup, cause of each meter drop). Each metric is a query over it.
- Bots needed: **idle**, **builder** (today's), **shopkeeper**, **safety-first**, **cheapskate**, **Pencitraan**, **honest**, **random placer** (for accidental combos), **hint reader**.
- Bots never hesitate. A bot miss is a real miss. A bot pass is a lower bound.
- Source tags: **[DV]** Dungeon Village, **[GDS]** Game Dev Story, **[PA]** Pocket Academy, **[HSS]** Hot Springs Story, **[MMS]** Mega Mall Story, **[CN]** Cafeteria Nipponica, **[SM]** Station Manager, from `research/kairosoft-raw/`. **[BL]** Backloggd and **[PG]** Pocket Gamer are cited by the research thread or GAME-DESIGN.md but are not in the raw folder. "Inferred" means my reading, not stated on the page.

### Time model

- **Run:** 8h of wall time for the core run (Hari). Wall time = real clock time at whatever speed the player picks. Kairosoft runs take 8–10h [BL, unverified here].
- **Speeds:** 1x and 2x only (Hari).
- **Calendar:** 8s = 1 week (Hari, 2026-10-31). A month is 4 weeks (32s at 1x). A year is 48 weeks (6.4 min at 1x). The year count is imaginary and need not match Kairosoft.
- **How bots convert:** gap bars are checked at **1x**, the worst case for waiting. Content run-out is checked at **2x**, the worst case for depth. Each popup adds a fixed wall cost (start at 5s) because popups pause the game.

### Time bands

| Band | Wall time | Player should | Novelty max | Goal max | Star gap | Stop point |
| --- | --- | --- | --- | --- | --- | --- |
| B0 Hook | 0–1 min | First house by 30s | 10s, no popups | tutorial steps | n/a | n/a |
| B1 Learn | 1–5 min | Close the loop once, 1★ | 30s | 90s | RT 4 min | n/a |
| B2 First session | 5–15 min | Finish RT, first SK | 30s | 2 min | RT 4 min | first SK |
| B3 Promotion | 15–30 min | Learn RW's new rule | 45s | 3 min | RW 7 min | 15 min |
| B4 Act 1 end | 30–60 min | Kelurahan, budget cycle, Lurah 3★ | 60s | 4 min | Kel 10 min | 15 min |
| B5 Act 2 start | 1–2h | Camat: first Act 2 rule | 90s | 5 min | Kec 15 to 25 min | 20 min |
| B6 Act 2 | 2–4h | New pressure: pinjol, judol, Aman | 2 min | 6 min | TBD | 20 min |
| B7 Act 2 to 3 | 4–6h | Province, then Pusat | 2 min | 8 min | TBD | 20 min |
| B8 Endgame | 6–8h | Laporan vs Sejahtera decides | 3 min | 10 min | TBD | 20 min |
| B9 After the end | 8h+ | Free play, optional New Game+ | none | none | n/a | ending |

- **Novelty** = any resident arrival, event, combo, unlock, building level or staff hire (same as section 3 target 5). Item 11 weights them by kind.
- **Goal** = a star checklist line, an SK, Lomba Agustusan, or an Inem gig. Inspections and resident arrivals do not count, so they cannot pad the bar.
- **Star gap** uses the section 2 targets. Act 1 keeps its length for now, so it ends near 52 min, inside B4 (Hari, 2026-10-31). The Kecamatan runs 0 to 3★ in **55 to 65** min at 1x (the bot fails below 45 or above 70), a star every 15 to 25 min; the shipped bot times are 15, 33 and 57 min. Act 2 targets after the Kecamatan, and Act 3, do not exist yet.


### A. Core loop

#### 1. Always a useful next move
- **Ask:** at any moment, can the player afford an action that brings an unmet goal line closer?
- **Why:** waiting with nothing useful to do is where players quit.
- **Kairosoft:** money, Town Points and research points come on different clocks [DV, GDS]. Event slots refill each season [DV Events page; the main page says per month, so the source conflicts]. Idle staff still earn research [GDS].
- **Good:** two or three spendable resources on staggered clocks. While saving for something big, a cheap useful action is open.
- **Bad:** the only affordable action is another Rumah that moves no goal.
- **Evidence:** T1. Per tick, does any affordable action cut the ETA of an unmet line?
- **Pass:** no stretch over 60s at 1x without one, any band, any seed.

#### 2. Data lint: nothing dead
- **Ask:** does every building, role, resource, event and trait move a number someone cares about?
- **Why:** dead parts dilute choices and waste build time.
- **Kairosoft:** every structure has upkeep, so a useless one costs money [DV, PA]. Tips say to remove what you do not need [PA]. Staff names are puns, but each has stats [GDS].
- **Good:** every part feeds a meter or goal, and has upkeep or a stated trade-off.
- **Bad:** a decoration with no effect, or an event card that changes nothing.
- **Evidence:** T1 data check over `src/data/`. Build the source → effect graph.
- **Pass:** 0 orphans among buildings, events, traits and combos. Lowongan requirement lines and Inem's flirt lines are exempt on purpose. Known test case: Patung Ikon has no listed effect in section 2.

#### 3. Growth shows on the map
- **Ask:** does progress show where the player looks, not only in menus?
- **Why:** the Kairosoft reward is watching the place fill up.
- **Kairosoft:** visitors walk to buildings, and a boss walks the streets [DV]. There are two one-time town expansions, at 1,000 Pop and at 4★ [DV].
- **Good:** the map widens once per promotion. People visibly use what you built.
- **Bad:** a star that only changes a number in a menu.
- **Evidence:** T2. Sprite count in the default view, 60s before and after each star, from the player's own actions.
- **Pass:** each star adds at least N sprites in view (N to be set from a first measured run).

#### 4. Skill matters
- **Ask:** does a thoughtful player beat an idle one by a clear margin?
- **Why:** if idling reaches stars nearly as fast, the choices are cosmetic.
- **Kairosoft:** inferred. Placement, combos and staff picks set the score.
- **Good:** idle reaches 1★ and stalls. Builder is much faster.
- **Bad:** idle reaches 3★ within 1.2x of the builder.
- **Evidence:** T1. Idle vs builder star times, per band.
- **Pass:** idle is at least 2x slower than builder to every star after 1★.

#### 5. Meters stay in play
- **Ask:** does each meter move through its range, or sit at floor or cap?
- **Why:** a pinned meter has no tension and stops mattering.
- **Kairosoft:** popularity hits 100 and triggers Fever, then drops [MMS].
- **Good:** Popularitas, Sabar, Aman and Sejahtera each spend most of the run between 20 and 90.
- **Bad:** Popularitas parked at 90 from hour 1.
- **Evidence:** T1. Share of ticks each meter sits within 5 of its floor or cap.
- **Pass:** under 25% for each meter, per band, for the builder bot.

#### 6. Causes are legible
- **Ask:** when a meter drops, does the game say why?
- **Why:** an unexplained loss reads as a bug and teaches nothing.
- **Kairosoft:** inferred. Short status pop-ups over buildings and people.
- **Good:** every drop links to its cause ("Preman at Warung: −0.2").
- **Bad:** Sabar falls and the player has to guess.
- **Evidence:** T1 logs a cause for each drop. T2 checks it is shown.
- **Pass:** every drop over 2 points in a month has a logged and shown cause.

### B. Goals and stop points

#### 7. Goal cadence and stop points
- **Ask:** how long between goals met, and between payoff screens?
- **Why:** a goal done and a new one in view is the hook. Players stop at a payoff, and come back for what it shows next.
- **Kairosoft:** Dungeon Village has 5 ranks of 3–4 mixed lines (population, income, events held, quests, and on ranks 1, 3 and 5 a named building) [DV]. Lines finishing at different times is inferred. Yearly national rankings [MMS]; graduation each year [PA].
- **Good:** 3–4 mixed lines per star, one of them a named building where it fits. A payoff screen every 15–20 min that ends with the next goal on screen.
- **Bad:** one big number to grind. No payoff for 40 min.
- **Evidence:** T1 timeline. Gaps between goals, and between stop points.
- **Pass:** Goal max and Stop point columns, 10 of 10 seeds. The next goal is shown within 5s of every stop point.

#### 8. Three horizons at once
- **Ask:** is there always a short, a mid and a long goal whose progress moves?
- **Why:** short keeps hands busy, mid gives the session a shape, long brings you back tomorrow.
- **Kairosoft:** short = this month's build or event. Mid = next rank, Golden Week [HSS], yearly graduation [PA]. Long = the year-16 score [DV, HSS].
- **Good:** the next star line (short), the next star or Lomba (mid), and the 2045 review (long) all visibly move.
- **Bad:** the 2045 meter is on screen but never moves, so it is not a goal.
- **Evidence:** T1 goal ETAs; T2 that each is on screen.
- **Pass:** a short (<2 min) and a mid (<15 min) goal in ≥90% of ticks after minute 2. The long meter changes at least once per stop point.

#### 9. Goals say what is missing
- **Ask:** does every unmet line name the exact gap?
- **Why:** an unclear goal reads as a bug. Existing rule (section 1, Clarity).
- **Kairosoft:** rank lines are plain counts: "Events Held: 15", "Build: Restaurant" [DV].
- **Good:** "Warung Sembako 2 of 3". A tap jumps to where you fix it.
- **Bad:** "Improve the kampung".
- **Evidence:** T2. Each goal line holds a count or a name.
- **Pass:** 100%.

#### 10. Gates that loosen
- **Ask:** if a player is stuck on a gate, does it ease over time?
- **Why:** a hard gate with no relief ends runs.
- **Kairosoft:** office upgrade 2 needs money and awards in years 4–6, either one in years 7–9, and neither after year 10 [GDS].
- **Good:** a stuck player gets a second route or a lower bar after a set time. A fast player still goes faster.
- **Bad:** one fixed route that a bad seed can miss.
- **Evidence:** T1. Weakest non-idle bot; time stuck at each gate.
- **Pass:** no gate holds it more than 2x the band's star gap.

### C. Rewards

#### 11. Novelty and content depth
- **Ask:** how long between new things, and does new content last to the end?
- **Why:** an 8h run with 1h of content is a 7h grind.
- **Kairosoft:** filling the popularity bar rolls a new adventurer, monster, event or a medal; once new things run out, only medals come [DV]. Dungeon Village unlocks 19 buildings across 5 ranks, plus 25 repeatable and 5 one-time events [DV]. Mega Mall has 31 combos [MMS].
- **Good:** a steady drip, weighted toward new systems and buildings, not decor. New content lasts into B8, with a fallback reward after.
- **Bad:** today's state: built content covers about B0–B4 (about 1h). Or decor held back to fake late novelty.
- **Evidence:** T1 timeline at 1x for gaps. Count of first-seen items at 2x for depth. Weight: system 3, building 2, other 1.
- **Pass:** Novelty max column. At least 6 weighted first-seen points per 30 min in every band B0–B8.

#### 12. Star rewards
- **Ask:** can the player use a star's reward right away, and does it bring more than one kind of thing?
- **Why:** an unaffordable unlock is a counter, not a reward. The same kind every time stops feeling like a reward.
- **Kairosoft:** ranks unlock 1–5 buildings plus plants and events, and often a system: Rearrange [★1], Cauldron [★2], more events [★3, ★5], Expand Town [★4] [DV]. A price spread per rank is inferred.
- **Good:** each star brings at least one non-decor thing to place now, one dear thing to save for, and about every other star a new system or verb.
- **Bad:** the only unlock costs three minutes of income. Or a star that only adds another shop.
- **Evidence:** T1. Cash at star time against the cheapest non-decor unlock. Each unlock tagged by kind.
- **Pass:** that unlock is affordable within 30s in 10 of 10 seeds. Every star bundles 2+ kinds. A new system at least every 2 stars.

### D. Economy

#### 13. Sources and sinks
- **Ask:** does every resource have a source and a sink that both get used?
- **Why:** a resource with no sink piles up and stops mattering.
- **Kairosoft:** money pays build and upkeep. Town Points pay events, research and job changes [DV]. Research points pay levels and boosts [GDS]. Salaries are paid each March [GDS].
- **Good:** each resource has a steady sink (upkeep, salary) and a lumpy sink (a big build, an event).
- **Bad:** a resource that only goes up.
- **Evidence:** T1 data check plus the bot spend log.
- **Pass:** every resource is earned and spent in every band where it exists.

#### 14. Cash health
- **Ask:** does cash pile up with nothing to buy, or run out with no way back?
- **Why:** hoarding means the cost curve ran ahead of content. Debt means it ran behind.
- **Kairosoft:** year-1 salaries are paid by a grant [GDS]. Late cash buys dear upgrades and ads [GDS]. Reviewers flag debt traps in Pocket Academy [PG].
- **Good:** a safety net early. A sink late that scales with income.
- **Bad:** millions in the bank at hour 5 with nothing to buy.
- **Evidence:** T1. Cash against the cost of the next key item (item 15).
- **Pass:** cash above 5x that cost never lasts over 3 min. Cash never below 0 for the builder or idle bot in any band.

#### 15. Cost curve and snowball
- **Ask:** does time-to-afford the next key item stay in a band, and does income outgrow costs?
- **Why:** too short makes money meaningless. Too long is a grind wall. Runaway income breaks every later bar.
- **Kairosoft:** ad prices run from 30K to 9,900K across three office tiers [GDS], so each tier resets what "dear" means.
- **Good:** prices step up with each stage, in line with income.
- **Bad:** flat prices, so Act 2 buys everything at once.
- **Evidence:** T1. Seconds of sim income at 1x for the next key item. Ratio of income growth to cost growth per stage.
- **Pass:** 30s to 2 min in B0–B4, never over 5 min. Income growth per stage within 0.7–1.5x cost growth.

#### 16. Diminishing returns
- **Ask:** does repeating the same action pay less over time?
- **Why:** without it, one action wins forever and choices collapse.
- **Kairosoft:** the same ad type stops adding fans [GDS]. Training stops working after a while [GDS]. Each item bought raises the others' price [GDS]. Contracts pay early and are not worth it later [GDS].
- **Good:** early tools fade as better ones open.
- **Bad:** the best move in minute 5 is still the best in hour 6.
- **Evidence:** T1. Star time saved per unit of the binding resource (Rupiah, Orang Dalam, Dana, Stempel), per action, per band.
- **Pass:** no single action is the top payoff in more than 2 bands. Basics every strategy needs (Rumah, Warung) are exempt.

### E. Choices

#### 17. No dominant strategy
- **Ask:** do different plans all work, and differ in what they get?
- **Why:** if one plan always wins, the other choices are fake.
- **Kairosoft:** upkeep caps how much you build [DV]. Placement matters: floor bonus [MMS], combos within 2 tiles [HSS]. Choose medal recipients well [DV].
- **Good:** several plans reach the stars. They differ in score, meters or ending, not only speed.
- **Bad:** one build order that wins on every metric.
- **Evidence:** T1. Builder, shopkeeper, safety-first and Pencitraan bots.
- **Pass:** no bot wins every metric. For each star, slowest over fastest ≤1.3, unless the gap is under 2 minutes (too small to feel; Hari, 2026-11-01). The cheapskate bot has its own bar: it is never stranded. It reaches RT 2★ in at least half the seeds, and a builder bot can take over its game and still progress. It does not have to reach RT 3★, because neglect is allowed to cost the player (Hari, 2026-11-01).

#### 18. Every choice has a cost
- **Ask:** does each event option trade something?
- **Why:** an option better on every number is not a choice.
- **Kairosoft:** in a dungeon, adventurers earn nothing for the town [DV]. Harder contracts pay more, but failing costs reputation [GDS].
- **Good:** each option names what you give up.
- **Bad:** a free option that is also the best.
- **Evidence:** T1 data check on event options.
- **Pass:** 0 strictly dominated options.

#### 19. Laporan vs Sejahtera
- **Ask:** does gaming the Laporan pay short term and cost long term?
- **Why:** this is the satire's core. If honest play is always best, the joke has no teeth.
- **Kairosoft:** no match. This one is ours.
- **Good:** Pencitraan reaches stars faster. Honest play ends with higher Sejahtera. Each reaches a different ending.
- **Bad:** one path wins on both scores.
- **Evidence:** T1. Pencitraan bot vs honest bot.
- **Pass:** in 10 of 10 seeds, Pencitraan is 10–30% faster to stars (inside item 17's 1.3 cap), honest ends higher on Sejahtera, and the endings differ.

#### 20. Management load
- **Ask:** do the taps needed per minute stay bounded as the map grows?
- **Why:** each stage adds RTs to tend, and micromanagement can turn fun into chores. The playtest of 2026-11-01 found 16 RTs too many; the ladder is now 1, 2, then 4.
- **Kairosoft:** Station Manager runs one station at a time; the others pay 40% of income on their own [SM].
- **Good:** each stage brings a way to delegate (Auto-dana, staff) before the load doubles.
- **Bad:** funding 16 RTs one by one every month.
- **Evidence:** T1. Required actions per minute for the builder bot, per band.
- **Pass:** never above the B2 peak by more than 1.5x.

### F. Combos

#### 21. Combo discovery
- **Ask:** are some combos found by accident and some only by intent?
- **Why:** accidental finds teach the system. Hidden ones reward study.
- **Kairosoft:** Mega Mall has 31 combos. The formulae for most are sold over time; the last 8 are never hinted [MMS]. Hot Springs combos fire within 2 tiles [HSS].
- **Good:** about 3 in 4 hinted or likely by accident, 1 in 4 hidden. A clear distance rule.
- **Bad:** all hidden, or all obvious.
- **Evidence:** T1. A random-placement bot for accidental finds. A hint-reading bot for hinted ones.
- **Pass:** the random bot finds ≥3 in B0–B2. The hint bot finds 65–85%. Every combo is found by some bot.

### G. Calendar and randomness

#### 22. Calendar rhythm
- **Ask:** does each stage have fixed beats the player can plan for, spaced like real occasions?
- **Why:** known dates turn randomness into planning. With a 6.4-min year, yearly beats can come too often.
- **Kairosoft:** Golden Week every month 5 [HSS]. Events in months 6 and 11, recruited a month ahead [PA]. Salaries every March [GDS]. Medals at year end [DV].
- **Good:** 2–4 fixed beats per stage, each warned well ahead. Big days (Lomba Agustusan, a Lomba Kecamatan) feel rare: some every year, the biggest every 2–4 years.
- **Bad:** all events random. Or a "big day" every 4 min.
- **Evidence:** T1 timeline. Fixed beats per stage, warning lead in wall seconds, gap between big days.
- **Pass:** ≥2 fixed beats per stage. Each warned ≥30s of wall time ahead. Big days ≥10 min of wall time apart.

#### 23. Reliability: seeds, bad luck, recovery
- **Ask:** do runs stay on track across seeds and after bad luck?
- **Why:** too much spread feels unfair. A loss with no fix ends runs. Rule: bad choices slow you, never soft-lock.
- **Kairosoft:** rank lines are player-driven [DV]. A boss drains popularity until killed and pays well when it is [DV]. Downed adventurers recover over time, faster at an Inn [DV]. Some buildings exist only on certain maps [PA].
- **Good:** the order of events changes and the shape of the run does not. Each threat has a fix, a cost while it lasts and a reward for fixing it.
- **Bad:** one seed stalls for 5 min. A loss that lasts with no fix.
- **Evidence:** T1. Builder on 10+ seeds per stage; a forced worst event chain.
- **Pass:** every star within target in 10 of 10 seeds (section 3 target 4). Slowest over fastest seed ≤1.5. Worst chain: next star within 2x target. Never a soft-lock.

### H. Progression, ending and return

#### 24. Stage change feels new
- **Ask:** does a promotion bring a new system and keep the old map useful?
- **Why:** a promotion that is just a bigger copy is a grind.
- **Kairosoft:** office moves add seats, training, ads and hiring [GDS]. Other stations keep progress and pay 40% of income [SM].
- **Good:** each stage adds a new verb (Dana, Stempel, Anggaran). The old area keeps paying in.
- **Bad:** the same loop on a bigger map.
- **Evidence:** T1 unlock list; T2 screenshots.
- **Pass:** ≥1 new system per stage. First star of the new stage within its target.

#### 25. The run ends
- **Ask:** is there a clear end, with a score, near 8h?
- **Why:** an end gives the run a shape and a reason to push.
- **Kairosoft:** the score is taken in year 16 [DV, HSS, MMS, CN] or 20 [GDS]. It mixes money with progress counts [HSS, CN]. Play continues after [DV, MMS].
- **Good:** Sidang Emas 2045 with a score and one of 4 endings. Free play after.
- **Bad:** no end, or an end that locks the save.
- **Evidence:** T1 bots reach each ending; T2 checks free play continues.
- **Pass:** all 4 endings reachable, at 7–9h of wall time. Unknown until Act 3 exists.

#### 26. Replay drivers (optional New Game+)
- **Ask:** is there a reason to start again?
- **Why:** optional per Hari, but it turns 8h into 20h for fans.
- **Kairosoft:** carry-over is small and specific. Funds do not carry [CN]. Staff stats carry [CN], one of each scenery piece [HSS], unlocked stores [MMS], genre levels [GDS]. A new run makes it "easier to beat your high score" [DV].
- **Good:** carry a little, never money. Chase another ending or a higher score.
- **Bad:** carry so much that the second run has no early game.
- **Evidence:** design check.
- **Pass:** at least one replay driver designed. Not required for the core 8h.

#### 27. Coming back
- **Ask:** when a player reopens the app, do they know where they were within 5s?
- **Why:** an 8h run is 20–30 sessions on a phone. Every return is a mini first-time experience.
- **Kairosoft:** inferred. The game resumes on the map, mid-month.
- **Good:** resume on the map with the current goal and what changed since last time.
- **Bad:** resume on a menu, or with no goal shown.
- **Evidence:** T2. Save, reload, screenshot at 5s.
- **Pass:** current goal and its progress on screen within 5s, in both languages.

### T3 human check (3 questions, 15 min)

- When did you first want to stop? Why?
- Name one choice you made on purpose. Did it matter?
- What did you want to do that the game would not let you?

### Out of scope here

- UI and layout: UI/UX checklist, next.
- Test coverage and CI: testing checklist, after that.
