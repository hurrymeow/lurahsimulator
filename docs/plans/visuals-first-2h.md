# Visuals: buildings unlocked in the first 2 hours

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
