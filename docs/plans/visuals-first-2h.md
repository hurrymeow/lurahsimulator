# Visuals: buildings unlocked in the first 2 hours

## Round 2, 2026-11-07: Hari's notes on round 1

Images: [visuals-r2-before.png](visuals-r2-before.png) (round 1) against [visuals-r2-after.png](visuals-r2-after.png), each building at every level with its silhouette; [visuals-r2-fish.gif](visuals-r2-fish.gif), the fish on the live map; [visuals-first-2h-preview.png](visuals-first-2h-preview.png), all 56 buildings again.

| Note | What changed |
| --- | --- |
| No bubble trees | Pohon Rindang, Taman and Taman Kota use the canopy tree from ART.md: a sturdy trunk and two or three stacked tiers, each a 2:1 disc lit top left with a shade band under its rim. The parks hold several smaller trees at different sizes, with paths, a bench and a flower bed. |
| Gapura: 2 columns, bolder L2 | Two pillars and a banner beam across the lane. L2 stands the pillars on stepped plinths, adds gold capitals and finials, and puts a small red roof with a gold gable over the beam. |
| Portal L2 | Own art, not just the fence: striped concrete pillars, a hansip booth with a lamp, a boom with a counterweight, and a yellow-and-black speed bump. |
| Moving fish | Kolam Lele: dark lele with whiskers and pale bellies in murky green water, now and then coming up for air in a ring. Kolam Pancing: orange and silver fish. Each fish swims its own loop, faces the way it goes and flicks its tail. They hold still with reduce motion. The frame-rate e2e test passes. |
| Mural is a wall | A long, thin wall with a coping and paint cans: sky, sun, hills, two houses and a merah putih band. |
| IndoApril = BetaMart silhouette | One shared shape, a flat dak with a box sign on the roof (pylon and ATM at L2). Only the colours and patterns differ: fascia stripes, mullion rhythm and sign. |
| Sawah grows | Rice stands in the rows: 2px seedlings at L1, 4px green clumps at L2, 6px golden heads at L3. Kebun Sayur got the same idea: sprouts, then leafy plants, then chilli and tomato. |
| Gudang Material | An open builder's shed under galvanised zinc (ribbed, with a shine), steel posts and a low front wall. The stock shows through: bata merah, semen sacks, a sand heap and pipes. The back walls have open window bays. |
| Kantor RT L2, Warung L2 smaller | Kantor RT L2 is a smaller, lower office (inset 3, 9px walls, rise 6) under the L3 pendopo. The Warung L2 gerobak has a lower lean-to and a shorter glass case. |
| Big halls broken up | Kontrakan: three rumah petak, each with its own pelana and wall colour, and a jemuran in the yard. Balai RW: a hall, a lower office wing, a teras over the door and a flag. Balai Warga: an open pendopo on a plinth under a two-tier roof, with a kitchen annex. Koperasi (RT): a zinc warehouse behind a lower blue-roofed shopfront, with sacks by the door. |
| Posyandu progression | L1: a pink tarp on bamboo poles over a table and the dacin scale, with mats and stools. L2: the clinic and a porch with a bench. L3: a bigger clinic in white and pink, a porch, a sign pole and a play corner. |

**Engine:** `src/render/massing.ts` adds `prism` (a box over any rectangle of the lot) and `roofRect` (hip, gable either way, shed or flat over any rectangle). Both draw in native pixels, so edges stay 1px on 2x2 lots. They are what lets a lot hold several small masses. `hasArt()` in `iso.ts` lets the stage test find art in any table.

**Checks:** typecheck and all 641 unit tests pass. The e2e frame-rate check passes at 412px id.

---

## Round 1, 2026-11-07: local preview, waiting for Hari's verdict

Redrawn on branch `claude/determined-hypatia-oz3xji`, with no PR yet. Images:

- [visuals-first-2h-before.png](visuals-first-2h-before.png) and [visuals-first-2h-after.png](visuals-first-2h-after.png): the changed buildings at every level, each with a black silhouette beside it, so outlines can be compared without colour.
- [visuals-first-2h-preview.png](visuals-first-2h-preview.png): all 56 first-2h buildings with the changes.

The aim is a different outline for every shop: level 1 smallest and simplest, the top level biggest and busiest. Each design uses a few massing moves named after Di Mari and Yoo's *Operative Design* catalogue, such as Lift, Extrude, Stack, Shift and Bend. These were worked from the book's catalogue of operations as I know it; I did not have copies of the books.

| Building | L1 | L2 | L3 |
| --- | --- | --- | --- |
| Rumah Makan | Gerobak bakso **lifted** on two wheels under a striped payung (no longer looks like Bank Sampah) | Plank warkop **extruded** off a back wall, open counter, zinc lean-to, bench | Warteg: etalase of dishes, teal door, green pelana, blue nameboard **false front** |
| IndoApril | Small branch, flat dak, blue band over red and yellow stripes, box sign on the roof | Full store, bigger sign box, blue pylon, ATM | – |
| BetaMart | Small branch, **low red mansard**, red fascia over blue band, red canopy **shifted** over the door | Full store, red pylon, ATM | – |
| Fotokopi | Kios: one copier under a blue lean-to, printed banner | Toko: blue shed roof, banner **extruded** above it, rolling door, ATK case | Ruko: second floor **stacked** on, vertical ATK sign |
| Apotek | Kios obat under a green pelana, green cross on a post | White shop under a green hip, cross on a tall pylon | Apotek with praktik dokter **stacked** above, balcony, lit cross |
| Barbershop | Pangkas rambut: chair and mirror on a plank wall under a tarp | Teal kiosk, red pelana, barber pole | Charcoal shop, gold nameboard, glass front with chairs |
| Bengkel | Tambal ban: orange tarp on posts, tyre stack, compressor, tyre-on-a-stick sign | Grey garage, blue pelana | Bengkel resmi: two blue roller doors, red fascia, box sign |
| Lampu Jalan | Pole with a **bent** arm and hanging lamp (was a ball on a stick, like Patung Ikon) | – | – |
| Patung Ikon | Golden durian on a two-step plinth | – | – |
| Kantor Kecamatan | Long flat-roofed block, clock tower with the flag on the front corner (was the same pyramid as the next three) | kit | kit |
| Pos Satpol PP | Flat dak, lookout cabin **lifted** onto the roof, radio mast | kit | kit |
| Koperasi Simpan Pinjam | One long, low pelana | kit | kit |
| Balai Latihan Kerja | Zinc workshop hall with a raised monitor roof | kit | kit |

"kit" means the shared upgrade kit: a fence at L2, a stone wall and lamp at L3.

**Engine fix found on the way:** `Painter.box()` never drew the back half of a box's top face (its row loop started too low in the middle columns). Pitched roofs hid this, but every flat roof showed a heart-shaped notch: IndoApril, BetaMart, Fotokopi, Toko Kelontong and Kos-kosan L2 in the live build. The fix makes those roofs whole. The preview sheet shows no regression on the other buildings.

**Checks:** typecheck and `npm test` pass, including the art height, level and footprint tests. Because the Kantor Kecamatan tower would break the "2x2 reads wide, not tall" bar at the back corner, it stands on the front corner. E2e has not been run yet; it will be before the PR.

**For Hari to decide before the PR:**

1. IndoApril and BetaMart now use colours close to the real chains (blue/red/yellow; red/blue/yellow), with no logos and the parody names kept. ART.md says "No third-party art or names". Is a colour scheme alone fine, or should the doc say so explicitly?
2. ART.md "Building levels" and "Roofs and walls" will need a short paragraph on the new shop progressions. Under AGENTS.md, that doc change and a `decisions/` note go in the same PR.
3. Still not redrawn: Koperasi (RT 2x2), Kandang Ayam, and the ground pieces whose levels look the same (Selokan, Kebun Sayur, Sawah, Kolam Lele, Tukang Parkir).

---


Working list for a visuals pass. Contact sheet: [visuals-first-2h.png](visuals-first-2h.png). It shows every level of each sprite, rendered by `isoURL` from `src/render/iso.ts` as build-menu thumbnails, so it does not show footprint size. Times are the design targets at 1x (GAME-DESIGN.md §2–3).

Every building below has a sprite. None is missing. Notes are first impressions from the sheet, to check in game before changing anything (ART.md "Adding a sprite").

| When | Building (id) | Size | Levels | First-look note |
| --- | --- | --- | --- | --- |
| RT 0★, start | Rumah (`rumah`) | 1x1 | 3 | OK |
| | Jalan Setapak (`jalan`) | 1x1 | 1 | Plain tile |
| | Kantor RT (`kantorRT`) | 1x1 | 3 | Big jump from L1 to L2 |
| | Warung Sembako (`warung`) | 1x1 | 3 | OK |
| | Pos Ronda (`posRonda`) | 1x1 | 3 | L1 is a small crate-like hut |
| | Rumah Makan (`rumahMakan`) | 1x1 | 3 | L1 (gerobak) reads small next to L2 and L3 |
| | Wifi Tower (`wifi`) | 1x1 | 2 | L1 is a thin pole and hard to read |
| RT problem | Selokan (`biopori`) | 1x1 | 3 | Levels look almost the same |
| | Gudang Material (`gudangMaterial`) | 2x2 | 3 | OK |
| | Kebun Sayur (`kebunSayur`) | 1x1 | 3 | Levels look almost the same |
| | Fotokopi dan ATK (`fotokopi`) | 1x1 | 3 | OK |
| | Pos Satpam (`posSatpam`) | 1x1 | 3 | OK |
| | Tukang Parkir Liar (`parkir`) | 1x1 | 3 | Levels look almost the same |
| RT 1★, ~1.5 min | Kos-kosan (`kosan`) | 2x1 | 2 | OK |
| | Barbershop (`barbershop`) | 1x1 | 3 | No barber pole or sign: looks like a plain house |
| | Sawah (`sawah`) | 2x2 | 3 | Levels look almost the same |
| | Praktik Bidan (`bidan`) | 1x1 | 1 | OK |
| | Pohon Rindang (`pohon`) | 1x1 | 1 | OK |
| RT 2★, ~7 min | IndoApril (`indomaret`) | 1x1 | 2 | Nearly the same as BetaMart |
| | BetaMart (`alfamart`) | 1x1 | 2 | Nearly the same as IndoApril |
| | Lapangan (`lapangan`) | 2x3 | 1 | Small, flat thumbnail |
| | Bank Sampah (`bankSampah`) | 1x1 | 2 | OK |
| | Bengkel Motor (`bengkel`) | 2x1 | 3 | OK |
| | PAUD (`paud`) | 2x2 | 3 | OK |
| | Panggung Senam (`panggungSenam`) | 2x2 | 1 | OK |
| | Kandang Ayam (`kandangAyam`) | 1x1 | 3 | Small |
| | Balai-balai Bambu (`bangku`) | 1x1 | 1 | Small |
| RT 3★, ~14 min | Apotek (`apotek`) | 1x1 | 3 | Looks a lot like Fotokopi |
| | Koperasi (`koperasi`) | 2x2 | 3 | OK |
| | Balai Warga (`balaiWarga`) | 2x2 | 3 | OK |
| | Kolam Pancing (`kolamPancing`) | 2x2 | 1 | Small, flat thumbnail |
| | Lampu Jalan (`lampuTaman`) | 1x1 | 1 | Looks like Patung Ikon |
| | Mural Kampung (`mural`) | 1x1 | 1 | OK |
| RW 0★, ~15 min | Balai RW (`balaiRW`) | 2x2 | 3 | OK |
| | Kontrakan (`kontrakan`) | 2x2 | 2 | OK |
| | Kolam Lele (`kolamLele`) | 1x1 | 3 | Levels look almost the same |
| | Patung Ikon (`patungIkon`) | 1x1 | 1 | Gold post that reads like a lamp, for a 5jt + 2 Orang Inside landmark |
| RW 1★ | Posyandu (`posyandu`) | 2x1 | 3 | OK |
| | Portal (`portal`) | 1x1 | 2 | OK |
| RW 2★ | Pasar Kaget (`pasarKaget`) | 2x1 | 2 | OK |
| | Gapura (`gapura`) | 1x1 | 2 | OK |
| Kel 0★, ~30 min | Kantor Kelurahan (`kantorKel`) | 2x2 | 3 | OK |
| | Aspal Ulang (`aspalUlang`) | 2x2 | 1 | Plain grey tile (it is a joke building, so this may be on purpose) |
| Kel 1★ | Puskesmas Pembantu (`puskesmasPembantu`) | 2x2 | 3 | OK |
| | Studi Banding (`studiBanding`) | 2x2 | 1 | Tiny |
| | Pasar (`pasar`) | 2x2 | 3 | OK |
| Kel 2★ | Terminal (`terminal`) | 3x3 | 2 | The one 3x3 landmark: check it reads as one on the map |
| | Taman (`taman`) | 2x2 | 3 | OK |
| Kec 0★, ~45 min | Kantor Kecamatan (`kantorKec`) | 2x2 | 3 | Close to Kantor Kelurahan and Pos Satpol PP |
| | Pos Satpol PP (`posSatpol`) | 2x2 | 3 | Close to Kantor Kecamatan |
| | Koperasi Simpan Pinjam (`koperasiSP`) | 2x2 | 3 | OK |
| | Balai Latihan Kerja (`balaiLatihanKerja`) | 2x2 | 3 | OK |
| Kec 1★ | Baliho (`baliho`) | 2x2 | 3 | OK |
| | Taman Kota (`tamanKota`) | 2x2 | 3 | OK |

## Candidates to start with

1. Levels that barely change: Selokan, Kebun Sayur, Sawah, Kolam Lele, Tukang Parkir. See ART.md "Building levels".
2. Look-alikes: IndoApril and BetaMart; Apotek and Fotokopi; Lampu Jalan and Patung Ikon; Kantor Kecamatan and Pos Satpol PP.
3. Weak landmarks: Patung Ikon, Terminal, Lapangan, Kolam Pancing.
4. Hard-to-read L1s: Wifi Tower, Pos Ronda, Rumah Makan, Barbershop.
