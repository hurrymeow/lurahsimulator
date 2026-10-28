# Game design

The one design doc for Pak Pejabat. A satirical kampung management sim, shipped as a PWA. You play Pak RT and work up the ladder to Pak Lurah.
It replaces the old DESIGN.md, STAGES.md and PACING.md, which were deleted.
Builder rules stay in their own files: [UI.md](UI.md), [ART.md](ART.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

## Contents

1. [Pitch and core loop](#1-pitch-and-core-loop)
2. [Stage ladder](#2-stage-ladder): RT, RW, Kelurahan or Desa, with stars and unlocks
3. [Pacing targets](#3-pacing-targets), with status
4. [Economy and balance](#4-economy-and-balance)
5. [Tone and politics guardrails](#5-tone-and-politics-guardrails)
6. [UI, art and tech rules](#6-ui-art-and-tech-rules)
7. [Build order](#7-build-order)

## 1. Pitch and core loop

- You are a village head. Build the kampung, keep the residents calm, and climb from Pak RT to Pak Lurah.
- Every joke is a mechanic that moves a number. Flavour text alone gets cut.
- The loop: build, residents arrive, money and Sabar (patience) move, events and combos fire, stars unlock more to build.
- The player never runs for office. Promotion is a performance review and an SK, the promotion letter. See [section 5](#5-tone-and-politics-guardrails).
- Bad choices slow you down. They never soft-lock the game.

### What the player sees

- Something new at least every 30s of real time at 1x: a resident, event, unlock or combo. Targets are in [section 3](#3-pacing-targets).
- Growth is visible on the map, not only in menus.

### Clarity

- Unmet requirements always say exactly what is missing.
- Discovered combos are auto-logged in the in-game Buku Combo.
- The Buku Combo is a collection grid under filter buttons (All, ✓ active, ★ found, ? not yet, each with its count). A tile shows the buildings (greyed when missing, silhouettes before it is in town), a state mark in its corner, the name and the effect in two lines. Tapping a tile opens the whole entry below its row: effect, conditions, status and, once discovered, the story (`src/ui/lists.ts`).
- The Warga list opens on a summary line (headcount and what everyone makes a month) and filter buttons: By job (default), No job (with its count) and By level. People sit in boxes per job, headed by the workplace sprite, the headcount and the group's monthly output; each person is a chip with their name and level stars. No job comes first, marked red.
- Speed control: pause, 1x, 2x, 4x.
- Text advances on tap, never on a timer.

## 2. Stage ladder

The full ladder runs RT, RW, Kelurahan or Desa, Kecamatan, Kabupaten/Kota, Provinsi and Pusat. Only stages 1 to 3 are specified. Kecamatan and above wait for a playtest of the Kelurahan. Approved by Hari on 2026-10-26.

Status 2026-10-27: the map engine, RT stars, RW and Kelurahan are built. The Desa path is not. Live grid sizes are 13x17 (RT), 26x34 (RW) and 52x68 (Kelurahan), which replace the 9x13, 18x26 and 36x52 in the sketch below. See `decisions/growing-map-engine.md`.

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
- This changes one rule in section 6: "tile diamonds ≥32px tall" becomes "tappable diamonds ≥32px tall".
- **Gate:** before building the Kelurahan map, it must pass the existing CI frame-rate test. Passed, after a fix. See `decisions/growing-map-engine.md`.

#### Carry-over

- Nothing pauses. Sabar, residents and the kas keep running.
- Kas RT becomes Kas RW, then Kas Kelurahan. AI areas pay iuran into it.
- Combos found earlier keep working where they stand.
- The ranking rival moves up a level. Kampung Sebelah becomes your RT, RW Sebelah becomes the rival, then Kelurahan Sebelah.

#### AI neighbours

- Every **3** months each AI RT places one building from the RT list. Its trait decides which one.
- An AI RT only builds when you have funded it. An unfunded RT visibly stalls.
- Ketua RT traits:
  - Rajin builds every **2** months and earns **x1.2**.
  - Hobi Wacana skips one build in three to hold a wacana.
  - Jarang Muncul builds on time but sends **2x** Surat Pengantar.

### Stage 1: RT

#### 0★ Pak RT (start)

- Open: warung, pos ronda, selokan, Kantor RT. Wifi at **8** residents.
- **Goal for 1★:** **10** residents and **1** combo found.

#### 1★ RT Rintisan

- Unlocks Indomaret, Alfamart and Kos-kosan. Kantor RT can reach level 2. Harga cabai starts.
- Their gate moves from a population count to this star.
- Reward: **+1** Orang Dalam.
- **Goal for 2★:** **25** residents, **1** ranking win and **2** combos.

#### 2★ RT Berkembang

- Unlocks Lapangan and Bank Sampah. Kantor RT can reach level 3.
- The scenery edge thins, so the neighbours' roofs show.
- **Goal for 3★:** **40** residents, **2** wins in a row, **3** combos and Sabar of at least **50**.

#### 3★ RT Teladan

- The SK to RW arrives.

#### New RT content

- **Kos-kosan:** houses **6**, costs **1** Sabar a month for the noise.
- **Lapangan:** doubles the 17 Agustus rewards.
- **Bank Sampah:** earns up to **Rp 40rb** a month.
- **Anak Kos** combo (Kos + Warung + Wifi): warung **x1.3**, **+1** Viral a month.
- **Panjat Pinang** combo (Lapangan + Pos Ronda): Agustus prize **+50%**.
- **Kali Bersih** combo (Bank Sampah + Selokan): banjir damage **20%** lower. The **80%** cap stays.

### Stage 2: RW

#### 0★ Pak RW (promotion)

- The map expands to 4 RTs.
- Unlocks Balai RW, the Stempel resource and Dana allocation.
- **Goal for 1★:** fund each neighbouring RT once, and keep the Stempel backlog under **5** for **6** months.

#### 1★ RW Rintisan

- Unlocks Posyandu, Portal and the Kader Posyandu job.
- **Goal for 2★:** every RT at 1★ or above, **1** win against RW Sebelah, and **2** RW combos.

#### 2★ RW Berkembang

- Unlocks Pasar Kaget, Gapura and the Calo job. The Musim Pindahan event starts.
- **Goal for 3★:**
  - every RT at 2★ or above, with at least **2** at 3★
  - **2** wins in a row
  - no RT in debt for **2** years

#### 3★ RW Teladan

- The SK to Kelurahan arrives.

#### New RW content

- **Stempel:** refills **3** a month. Every Surat Pengantar from an RT needs one. Each unstamped letter drains **0.5** Sabar a month. The player is now the permit queue.
- **Dana:** the new verb. You fund each RT, and it builds and levels only when funded.
- **Balai RW:** **+1** Stempel a month, **2** PNS slots.
- **Posyandu:** **+1** Sabar a month to neighbouring RTs.
- **Pasar Kaget:** **x3** income one month in four. Spawns **2** tukang parkir.
- **Gapura:** **+5** Viral in August and nothing otherwise. Repainting costs Rp every August.
- **Portal:** **+1** Sabar a month, ojol income **-30%**. Riders stop at the barrier.
- **Jalan Ditutup** combo (Pasar Kaget + Portal): market **x1.5**, ojol income **0** that month, **-1** Sabar.
- **Grup Chat Warga** combo (two neighbouring RTs with the same trait): **+2** Viral, **-1** Sabar a month.
- **Pos Siaga** combo (Posyandu + Portal): **+1** Sabar and **+1** Viral a month. It gives a 1★ player a second RW combo for the 2★ goal.
- **Agustusan Akbar** combo (Gapura + Lapangan): 17 Agustus pays **x2**.
- **Rivalitas Abadi** now also runs between your RT and Kampung Sebelah.
- **Kader Posyandu** job: **+0.5** Sabar a month, unpaid. Output falls **20%** a year unless you pay an Apresiasi of **Rp 300rb**.
- **Calo** job: turns **Rp 200rb** into **1** Stempel, **+0.1** Orang Dalam. **5%** a month chance of a scandal for **-6** Sabar.
- **Kerja Bakti** event: attendance equals Sabar. Selokan works **20%** better for **6** months.
- **Musim Pindahan** event: Surat Pengantar triple for **2** months.
- **Pendataan Warga** event: the reported population is off by **10%**, and the gap moves the ranking.

### Stage 3: Kelurahan or Desa

The player picks a path at promotion. Kelurahan is dense and shop-heavy. Desa makes the sawah and kebun ring buildable.

#### 0★ Pak Lurah or Pak Kades

- Unlocks Kantor Kelurahan (or Balai Desa) and Anggaran.
- **Goal for 1★:** every RW at 1★ or above, and serapan of at least **80%** for one year.

#### 1★

- Unlocks Puskesmas Pembantu and the Honorer job. Kelurahan gets Pasar. Desa gets BUMDes.
- **Goal for 2★:** every RW at 2★ or above, **1** Piala Kelurahan win, and a clean Tim Audit.

#### 2★

- Kelurahan unlocks Terminal and Taman.
- Desa unlocks Sawah Irigasi, Embung, Desa Wisata and the Pendamping Desa job.
- **Goal for 3★:** **3** Piala wins and every RW at 3★.

#### 3★ Lurah Teladan

- Credits roll. Play continues as a sandbox. Kecamatan comes later.

#### New Kelurahan content

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

## 3. Pacing targets

Approved by Hari, 2026-10-27. Times are real seconds at 1x. One month is 8s (`MONTH_MS`), so 15 min is about 112 months.
Measure with the test bot in `tests/balance.test.ts` (10 seeds, idle and builder). A bot never hesitates, so its times are lower bounds. A bot miss is a real miss. A bot pass is unproven.

### Targets

| # | Target | Why | Status 2026-10-27 |
| --- | --- | --- | --- |
| 1 | First house built within 30s of New Game | Kairosoft opens on a build. Idle time here loses the player. | Estimate: about 25 to 35s (6 taps, 57 tutorial words). Close to the line. Not timed. |
| 2 | First resident within 10s of the house | The first build must visibly pay off. | Pass: month 1 (8s) |
| 3 | First popup between 45s and 90s | Let the player learn the map first. | Pass: 48 to 56s |
| 4 | 1★ within 2 min, 2★ within 5 min, 3★ within 10 min | A goal done, a new one in view. | Pass in 10 of 10 bot seeds (1★ month 9, 2★ months 23 to 30, 3★ months 32 to 43). Enforced by `tests/balance.test.ts`. |
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

- **Resources:** every resource has an icon and a colour. Names are translated, see `decisions/resource-names.md`. Orang Dalam is "Orang Inside" in EN on purpose.
- **Growth gates:** stars gate content. Residents, wins and combos set the star goals. Stars never drop.
- **Kas:** Kas RT becomes Kas RW, then Kas Kelurahan. AI areas pay iuran into it.
- **Dana (RW):** you fund each neighbouring RT. An RT only builds and levels when funded. An unfunded RT visibly stalls.
- **Stempel (RW):** refills 3 a month. Every Surat Pengantar needs one. Each unstamped letter drains 0.5 Sabar a month.
- **Anggaran (Kelurahan):** a yearly budget arrives each January. Each unspent % cuts next year's budget by the same %. December brings a forced Serapan rush.
- **Safety net:** no debt or soft-lock in year 1, and year-1 cash never below 0 for the idle and builder bots (targets 8 and 9).
- **Tuning:** the balance autoplayer tunes star thresholds. How to read its results is in section 3.
- **Time:** one month is 8s at 1x (`MONTH_MS`). Speeds are pause, 1x, 2x and 4x.
- **Rule:** any change to a number a target depends on gets a note in `decisions/`.

## 5. Tone and politics guardrails

### Satire

- Satire targets systems and bureaucracy.
- No real politicians, parties, ormas or officials.
- No ethnic, regional or religious jokes.
- Every joke is a mechanic that moves a number (see section 1).
- UI defaults to English, with Bahasa Indonesia as a Settings option. Players who saved a language keep it. Slang and proper names stay as they are in both languages (Sabar, Wacana, Warga, warung, ojol, Kampung Sebelah). Resource names are translated, see `decisions/resource-names.md`. Strings live in `src/i18n/`.

### Staying out of real politics

- The player never runs for office. Promotion is a performance review and an SK, the promotion letter. No votes, parties, coalitions or campaigns.
- Superiors stay faceless: Pusat, Tim Audit, Kelurahan Sebelah. No named places and no real agencies.
- Satire targets how a system behaves, never who introduced it or when. Musrenbang and Dana Desa are fine. Flagship programs, the capital move and named slogans are out.
- Swap test: if a joke would not work in any country's bureaucracy, or needs a headline to land, cut it. Example: "blusukan" is tied to one real person, so it is out.
- Indonesia Emas 2045 stays the only real reference.
- No new brand names. Indomaret and Alfamart stay. Chat apps stay generic ("Grup Chat Warga").

## 6. UI, art and tech rules

These are the design-level UI rules. Measurable checks are in [UI.md](UI.md). Art detail is in [ART.md](ART.md).

### Touch and layout

- Mobile-first, portrait, touch controls. Every number (tap size, text size, contrast, word limits) lives in [UI.md](UI.md), not here.
- Main screen is the console frame, after a 90s train-and-city builder (`src/ui/console.ts`, `src/ui/console.css`). It is kept to two slim rows on top and one dock below, so the map has the room. Top to bottom:
  - a time row: play/pause and speed (one size, side by side), the date, and the compact Indonesia Emas 2045 meter;
  - a money row: the five resources;
  - the map, full width. A goal pill floats over its top-left corner (one line, "Now: reach 6 residents"; tap for the whole line and the next star), and a small satellite view over its top-right corner pans the map when tapped;
  - the month as a thin line along the top edge of the bottom bar;
  - a dock of three equal buttons, icon over label: Build, Warga, Menu.
- Why this arrangement: time controls sit with the date, as in most city builders, and change speed without leaving the map. The resources get a row to themselves, so big numbers have room. The goal floats over the map, as quests do in mobile builders, so neither row wraps. Build and Warga are the panels used many times a minute, so they get their own buttons; the rest stay one tap away in Menu.
- Build and Warga live only in the dock (`ActionButton.dock`), so the Menu does not list them twice. Every other panel opens from the single Menu button, grouped as Kampung, Records and Game. Settings and How to play live under Game. A new panel registers an `ActionButton` with a `group` in the Menu. Don't add other main-screen buttons.
- Notices are toasts, not a band: the latest one floats over the bottom of the map for 3 seconds, then fades. Tap it to open the Log. Every notice also stays in the Log (Menu > Log), so a missed toast is never lost. Important messages still use the pause-and-tap modal.
- The satellite view hides while a building is being placed.
- Light and Dark share one layout: every size, gap and position is the same, and only colours change. An e2e test compares the boxes in both themes.
- On short phones (640px tall or less) the satellite view drops out and the goal pill spans the map's width.
- Sheets, pop-ups, tips and the tutorial follow the theme too, so an open panel matches the frame behind it (see Themes below).
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
- PWA ships an install button and an update banner. Icons and the manifest follow Mono Dark; the page theme-color follows the theme.

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
4. Kelurahan or Desa.
5. Playtest, then decide on Kecamatan and above.

Status 2026-10-27: the map engine, RT stars, RW and Kelurahan have shipped. Pick the next stage work in the project chat. The Desa ring is not built.
