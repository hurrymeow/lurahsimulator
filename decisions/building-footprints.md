# Building footprints, zoom and the Warga list

- **Buildings take 1x1 or 2x2 tiles.** Sizes follow real lot sizes:
  - **Indomaret and Alfamart are 2x2.** Indomaret asks franchisees for a 120-200 m² site. Alfamart wants at least 100 m² of sales floor on a 150-250 m² lot. That is about ten warungs. ([detikFinance](https://finance.detik.com/berita-ekonomi-bisnis/d-7290667/cara-buka-gerai-alfamart-dan-indomaret-termasuk-biayanya), [CNBC Indonesia](https://www.cnbcindonesia.com/market/20250315115241-17-618874/segini-modal-buka-alfamart-sendiri-tahun-2025-cek-syaratnya))
  - **Wifi Tower is 2x2.** BAKTI asks regencies for a 400 m² plot per BTS tower. ([Gizmologi](https://gizmologi.id/news/bakti-bts-4g/amp/))
  - **Lapangan is 2x2.** A badminton court alone is 13.4 x 6.1 m (82 m²), and a volleyball court is 18 x 9 m (162 m²), before the upacara crowd stands round it. ([Antara](https://m.antaranews.com/amp/berita/4328135/ukuran-lapangan-dan-net-pada-olahraga-voli))
  - **Kos-kosan is 2x2.** It is a row of six rooms with a corridor, not a house.
  - **Balai RW and Pasar Kaget are 2x2.** A hall for the RW's queue, and stalls with parkir between them. They fit the two-tile RW seams.
  - **Everything else stays 1x1:** warung, pos ronda, selokan, jalan, rumah, parkir, bank sampah, Kantor RT (Pak RT's front room), posyandu, portal, gapura. Kelurahan buildings stay 2x2 as already planned.
- **Square footprints only.** The art is isometric, so a 2x2 draws its 1x1 sprite at twice the scale over a diamond twice the size. That keeps the pixels whole. A 2x1 lot would need new art.
- **The tapped tile is the lot's top corner.** The lot spreads toward the front of the screen. The ghost shows all four tiles, and the placement bar says "Takes 2×2".
- **Ranges count from the edge of the lot.** A combo radius of 1 means touching any tile of a 2x2. A path beside any edge tile gives the bonus. A tukang parkir spawns beside any tile. A big shop is never penalised for its size.
- **Old saves (v2) grow in place.** Each 2x2 tries the four 2x2 squares that keep its tile, on its own lot and not on anything else. If none fits, it stays 1x1 (`size: 1` on the building) rather than overlap or move far. Save version is now 3.
- **AI RTs build 2x2 too.** When a big shop no longer fits in their RT, they build a warung that turn instead.
- **The balance bot packs a 9x5 corner, one row deeper than before.** Four 2x2s don't fit in 9x4. A 2x2 (and a spare Pos Ronda after two years with no combo) goes where it completes the most combos, like a player reading the Buku Combo. Without this, one seed of ten put its tower out of reach of its only Pos Ronda and never found a combo. All 10 seeds reach 1★ by month 25 and 2★ by month 43. Before, it was month 19 and month 41.
- **Zoom is in whole scale steps, from 1 to 6.** Whole numbers keep pixel art crisp. One wheel notch (or ~50px of trackpad scroll) is one step. A pinch steps each time the fingers spread or close by a quarter. Both zoom around the pointer or the pinch midpoint. + and - zoom from the keyboard. Scale 1 is an overview, so its tiles are below the 32px tap size. Zooming back in restores that. The default view is unchanged.
- **After picking a job, Warga reopens at that resident.** The row scrolls to the middle and takes focus. Before, the list jumped back to the top.
