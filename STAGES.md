# Stage progression

The design for growing from Pak RT to Pak Lurah. Approved by Hari on 2026-10-26. Not built yet.

The full ladder runs RT, RW, Kelurahan or Desa, Kecamatan, Kabupaten/Kota, Provinsi and Pusat. Only stages 1 to 3 are specified here. Kecamatan and above wait for a playtest of the Kelurahan.

## Rules for every stage

- Each stage has stars from 0★ to 3★. Reaching 3★ sends an SK, the promotion letter.
- The SK can be declined. A player who loves the RT can stay Pak RT.
- Each star unlocks content and plays a fanfare.
- The goal for the next star is a checklist. Each unmet line says exactly what is missing.
- Stars never drop. Bad play slows the next star and never takes one away.
- A higher stage's stars need stars in the stage below. AI-run areas earn stars by the same rules as the player.
- Stars show next to the stage title in the Menu header. The top bar has no room at 320px.
- Target time at 1x: RT about **12** min, RW about **20** min, Kelurahan about **30** min. That is a star every **4**, **7** and **10** min. Between stars, something new still arrives every 1 to 2 min.
- The balance autoplayer tunes thresholds to hit these times.

## One growing map

The map never gets swapped out. At each promotion the scenery edge pulls back and shows the neighbours. The player's own area stays fully playable.

```
Stage 1: RT            Stage 2: RW               Stage 3: Kelurahan
9x13 tiles             18x26 tiles               36x52 tiles

 scenery                +------+------+          +-------------+-------------+
 +------+               | YOU  | Kpg  |          |             |             |
 | YOU  |               |  RT  | Seb. |          |  YOUR RW    |    RW 2     |
 |  RT  |   ------->    +--[RW lots]--+  ----->  |             |             |
 +------+               |  RT3 |  RT4 |          +---[Kelurahan lots]--------+
 scenery                +------+------+          |    RW 3     |    RW 4     |
                                                 +-------------+-------------+
                        AI builds RT2-4.          sawah and kebun ring becomes
                        You steer with Dana.      buildable on the Desa path
```

- RW = 2x2 RTs, about 18x26 tiles. Kampung Sebelah is the RT next door.
- Kelurahan = 2x2 RWs, about 36x52 tiles.
- RW buildings go on lots along the seams between RTs. Kelurahan buildings go on lots along the seams between RWs.
- RW keeps today's 64x32 tiles. A pinch out gives a view-only overview, and a tap there zooms back in.
- Kelurahan defaults to half-size tiles. Kelurahan buildings take a 2x2 footprint, so a lot still taps like one RT tile today.
- This changes one rule in DESIGN.md: "tile diamonds ≥32px tall" becomes "tappable diamonds ≥32px tall".
- **Gate:** before building the Kelurahan map, the 36x52 map must pass the existing CI frame-rate test.

### Carry-over

- Nothing pauses. Sabar, residents and the kas keep running.
- Kas RT becomes Kas RW, then Kas Kelurahan. AI areas pay iuran into it.
- Combos found earlier keep working where they stand.
- The ranking rival moves up a level. Kampung Sebelah becomes your RT, RW Sebelah becomes the rival, then Kelurahan Sebelah.

### AI neighbours

- Every **3** months each AI RT places one building from the RT list. Its trait decides which one.
- An AI RT only builds when you have funded it. An unfunded RT visibly stalls.
- Ketua RT traits:
  - Rajin builds every **2** months and earns **x1.2**.
  - Hobi Wacana skips one build in three to hold a wacana.
  - Jarang Muncul builds on time but sends **2x** Surat Pengantar.

## Stage 1: RT

### 0★ Pak RT (start)

- Open: warung, pos ronda, selokan, Kantor RT. Wifi at **8** residents.
- **Goal for 1★:** **12** residents and **1** combo found.

### 1★ RT Rintisan

- Unlocks Indomaret, Alfamart and Kos-kosan. Kantor RT can reach level 2. Harga cabai starts.
- Their gate moves from a population count to this star.
- Reward: **+1** Orang Dalam.
- **Goal for 2★:** **25** residents, **1** ranking win and **2** combos.

### 2★ RT Berkembang

- Unlocks Lapangan and Bank Sampah. Kantor RT can reach level 3.
- The scenery edge thins, so the neighbours' roofs show.
- **Goal for 3★:** **40** residents, **2** wins in a row, **3** combos and Sabar of at least **50**.

### 3★ RT Teladan

- The SK to RW arrives.

### New RT content

- **Kos-kosan:** houses **6**, costs **1** Sabar a month for the noise.
- **Lapangan:** doubles the 17 Agustus rewards.
- **Bank Sampah:** earns up to **Rp 40rb** a month.
- **Anak Kos** combo (Kos + Warung + Wifi): warung **x1.3**, **+1** Viral a month.
- **Panjat Pinang** combo (Lapangan + Pos Ronda): Agustus prize **+50%**.
- **Kali Bersih** combo (Bank Sampah + Selokan): banjir damage **20%** lower. The **80%** cap stays.

## Stage 2: RW

### 0★ Pak RW (promotion)

- The map expands to 4 RTs.
- Unlocks Balai RW, the Stempel resource and Dana allocation.
- **Goal for 1★:** fund each neighbouring RT once, and keep the Stempel backlog under **5** for **6** months.

### 1★ RW Rintisan

- Unlocks Posyandu, Portal and the Kader Posyandu job.
- **Goal for 2★:** every RT at 1★ or above, **1** win against RW Sebelah, and **2** RW combos.

### 2★ RW Berkembang

- Unlocks Pasar Kaget, Gapura and the Calo job. The Musim Pindahan event starts.
- **Goal for 3★:**
  - every RT at 2★ or above, with at least **2** at 3★
  - **2** wins in a row
  - no RT in debt for **2** years

### 3★ RW Teladan

- The SK to Kelurahan arrives.

### New RW content

- **Stempel:** refills **3** a month. Every Surat Pengantar from an RT needs one. Each unstamped letter drains **0.5** Sabar a month. The player is now the permit queue.
- **Dana:** the new verb. You fund each RT, and it builds and levels only when funded.
- **Balai RW:** **+1** Stempel a month, **2** PNS slots.
- **Posyandu:** **+1** Sabar a month to neighbouring RTs.
- **Pasar Kaget:** **x3** income one month in four. Spawns **2** tukang parkir.
- **Gapura:** **+5** Viral in August and nothing otherwise. Repainting costs Rp every August.
- **Portal:** **+1** Sabar a month, ojol income **-30%**. Riders stop at the barrier.
- **Jalan Ditutup** combo (Pasar Kaget + Portal): market **x1.5**, ojol income **0** that month, **-1** Sabar.
- **Grup Chat Warga** combo (two neighbouring RTs with the same trait): **+2** Viral, **-1** Sabar a month.
- **Agustusan Akbar** combo (Gapura + Lapangan): 17 Agustus pays **x2**.
- **Rivalitas Abadi** now also runs between your RT and Kampung Sebelah.
- **Kader Posyandu** job: **+0.5** Sabar a month, unpaid. Output falls **20%** a year unless you pay an Apresiasi of **Rp 300rb**.
- **Calo** job: turns **Rp 200rb** into **1** Stempel, **+0.1** Orang Dalam. **5%** a month chance of a scandal for **-6** Sabar.
- **Kerja Bakti** event: attendance equals Sabar. Selokan works **20%** better for **6** months.
- **Musim Pindahan** event: Surat Pengantar triple for **2** months.
- **Pendataan Warga** event: the reported population is off by **10%**, and the gap moves the ranking.

## Stage 3: Kelurahan or Desa

The player picks a path at promotion. Kelurahan is dense and shop-heavy. Desa makes the sawah and kebun ring buildable.

### 0★ Pak Lurah or Pak Kades

- Unlocks Kantor Kelurahan (or Balai Desa) and Anggaran.
- **Goal for 1★:** every RW at 1★ or above, and serapan of at least **80%** for one year.

### 1★

- Unlocks Puskesmas Pembantu and the Honorer job. Kelurahan gets Pasar. Desa gets BUMDes.
- **Goal for 2★:** every RW at 2★ or above, **1** Piala Kelurahan win, and a clean Tim Audit.

### 2★

- Kelurahan unlocks Terminal and Taman.
- Desa unlocks Sawah Irigasi, Embung, Desa Wisata and the Pendamping Desa job.
- **Goal for 3★:** **3** Piala wins and every RW at 3★.

### 3★ Lurah Teladan

- Credits roll. Play continues as a sandbox. Kecamatan comes later.

### New Kelurahan content

- **Anggaran:** the new verb. A yearly budget arrives each January. Each unspent % cuts next year's budget by the same %. December brings a forced Serapan rush.
- **Kantor Kelurahan / Balai Desa:** **4** PNS slots.
- **Puskesmas Pembantu:** **+2** Sabar a month.
- **Aspal Ulang:** costs Rp, adds **0** value, counts as spent.
- **Studi Banding:** costs **Rp 2jt**, returns one random wacana.
- **Macet Abadi** combo (Pasar + Terminal + Parkir): income **x1.6**, **-3** Sabar.
- **Perang Tarif** combo (Terminal + any Ojol job): both earn **x1.3**, **-2** Sabar.
- **Spot Instagramable** combo (Taman + Influencer): **+3** Viral a month, park upkeep doubles.
- **BUMDes:** **30%** chance of going mangkrak.
- **Embung:** banjir damage **30%** lower.
- **Panen Raya** combo (BUMDes + Sawah Irigasi): **Rp 2jt** harvest bonus.
- **Wisata Edukasi** combo (Desa Wisata + Sawah Irigasi): **+4** Viral, **-1** Sabar a month.
- **Honorer** job: does PNS work for half the pay. After **5** years, **20%** a year chance of becoming PNS.
- **Pendamping Desa** job: Dana Desa only pays out with one employed.
- **Tim Audit** event: each wacana with no receipt costs **2** Sabar.
- **Lomba Kelurahan** event: paint spending raises the score for one month.
- **Kunjungan** event: one month warning before a visit.

## Staying out of real politics

- The player never runs for office. Promotion is a performance review and an SK. No votes, parties, coalitions or campaigns.
- Superiors stay faceless: Pusat, Tim Audit, Kelurahan Sebelah. No named places and no real agencies.
- Satire targets how a system behaves, never who introduced it or when. Musrenbang and Dana Desa are fine. Flagship programs, the capital move and named slogans are out.
- Swap test: if a joke would not work in any country's bureaucracy, or needs a headline to land, cut it. Example: "blusukan" is tied to one real person, so it is out.
- Indonesia Emas 2045 stays the only real reference.
- No new brand names. Indomaret and Alfamart stay. Chat apps stay generic ("Grup Chat Warga").

## Build order

1. RT stars and late-game content (Kos-kosan, Lapangan, Bank Sampah, 3 combos). Fixes the dead zone after 14 residents.
2. Frame-rate spike for the 36x52 map.
3. RW: map growth, AI RTs, Stempel, Dana, RW content.
4. Kelurahan or Desa.
5. Playtest, then decide on Kecamatan and above.
