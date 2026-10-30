# Building ladder: the rest of the table

Hari approved the ladder on Oct 30: start 1x1 and cheap, RT stars 1x1 to 2x2, RW 2x2, Kelurahan 2x2 to 3x3, with cost and effect rising per tier (about x2 cost and x1.5 effect a tier). The first pass (#173, `decisions/building-shapes.md`) priced Apotek, Koperasi, Bengkel and Pasar Kaget. This pass audits every building against the ladder and fixes the ones that sat below their tier.

## Changes

| Building | Tier | Was | Now | Why |
| --- | --- | --- | --- | --- |
| Barbershop | RT 1★ | 1,4jt, 190rb | 2,6jt, 330rb | Cheaper than the Warung at the start tier |
| Kandang Ayam | RT 2★ | 1,2jt, 130rb | 2,4jt, 200rb | Below the 1★ Sawah it follows |
| Bank Sampah | RT 2★ | 1jt, 40rb, +0,5 Popularitas | 2jt, 60rb, +0,8 | Cheapest 2★ building by far |
| Kontrakan | RW | 1x1, 2,4jt, 4 beds, 100rb | 2x2, 7jt, 12 beds, 300rb | Smaller and cheaper than the RT 1★ Kos-kosan (2x1, 4jt, 8 beds) |
| Kolam Lele | RW | 1,8jt, 170rb | 3,6jt, 300rb | Below the RT farms |
| Posyandu | RW 1★ | 3,5jt | 5jt | Below the Balai RW it needs |
| Portal | RW 1★ | 2,5jt | 3,5jt | Same price as a RT 2★ shop |

Old saves: a Kontrakan grows to 2x2 where it fits, turned if that fits, else keeps its 1x1 (`small`) until moved, as in `decisions/building-shapes.md`. The `laddered` flag marks a save as done.

Kolam Lele stays 1x1: it is a flat pond that combos pair with a 1x1 neighbour, and a bigger pond would break those layouts. Its price follows the ladder.

## The whole table after this pass

Cost, upkeep and income are per month in rupiah; effects are per month.

| Tier | Building | Size | Cost | Upkeep | Income | Effect |
| --- | --- | --- | --- | --- | --- | --- |
| Start | Rumah | 1x1 | 800rb | 0 | 0 | 3 beds |
| Start | Warung Sembako | 1x1 | 1,5jt | 0 | 250rb | attract 2 |
| Start | Rumah Makan | 1x1 | 800rb | 15rb | 150rb | grows to level 3 |
| Start | Pos Ronda | 1x1 | 800rb | 50rb | 0 | +2 Popularitas |
| Start | Kantor RT | 1x1 | 5jt | 100rb | 0 | Orang Inside |
| Start | Jalan Setapak | 1x1 | free | 0 | 0 | road |
| Problem | Selokan | 1x1 | 400rb | 10rb | 0 | banjir damage down |
| Problem | Fotokopi dan ATK | 1x1 | 1,6jt | 10rb | 200rb | +0,05 Orang Inside |
| Problem | Pos Satpam | 1x1 | 1,2jt | 40rb | 0 | satpam jobs |
| Problem | Gudang Material | 2x2 | 2,5jt | 30rb | 100rb | tukang jobs |
| Problem | Kebun Sayur | 1x1 | 1jt | 10rb | 120rb | petani job |
| 8 warga | Wifi | 1x1 | 3,5jt | 150rb | 120rb | attract 3 |
| RT 1★ | Indomaret, Alfamart | 1x1 | 7jt, 6,5jt | 100rb | 800rb, 750rb | attract 3 |
| RT 1★ | Kos-kosan | 2x1 | 4jt | 80rb | 200rb | 8 beds, -1 Popularitas |
| RT 1★ | Barbershop | 1x1 | 2,6jt | 10rb | 330rb | +0,3 Popularitas |
| RT 1★ | Sawah | 2x2 | 2,5jt | 20rb | 220rb | petani jobs |
| RT 1★ | Pohon Rindang | 1x1 | 300rb | 0 | 0 | +0,3 Popularitas |
| RT 2★ | Lapangan | 2x3 | 6jt | 100rb | 120rb | +0,5 Popularitas, 17 Agustus x2 |
| RT 2★ | Bank Sampah | 1x1 | 2jt | 0 | 60rb | +0,8 Popularitas |
| RT 2★ | Bengkel Motor | 2x1 | 4,5jt | 40rb | 420rb | ojol slots |
| RT 2★ | PAUD | 2x2 | 3jt | 60rb | 0 | attract 3, guru jobs |
| RT 2★ | Kandang Ayam | 1x1 | 2,4jt | 15rb | 200rb | -0,3 Popularitas |
| RT 2★ | Balai-balai Bambu | 1x1 | 400rb | 0 | 0 | shop boost |
| RT 3★ | Apotek | 1x1 | 6jt | 40rb | 550rb | +0,5 Popularitas |
| RT 3★ | Koperasi | 2x2 | 8jt | 50rb | 700rb | |
| RT 3★ | Balai Warga | 2x2 | 4,5jt | 80rb | 0 | +0,1 Orang Inside |
| RT 3★ | Lampu Jalan, Mural | 1x1 | 600rb, 900rb | 15rb, 0 | 0 | shop boost, +1 Viral |
| RW | Kontrakan | 2x2 | 7jt | 60rb | 300rb | 12 beds |
| RW | Kolam Lele | 1x1 | 3,6jt | 20rb | 300rb | peternak job |
| RW | Patung Ikon | 1x1 | 5jt + 2 Orang Inside | 0 | 0 | wide boost |
| RW 0★ | Balai RW | 2x2 | 6jt | 150rb | 0 | Stempel |
| RW 1★ | Posyandu | 2x1 | 5jt | 120rb | 0 | +1 Popularitas to each neighbour RT |
| RW 1★ | Portal | 1x1 | 3,5jt | 40rb | 0 | +1 Popularitas, ojol -30% |
| RW 2★ | Pasar Kaget | 2x1 | 4,5jt | 80rb | 450rb | bursts, 2 parkir |
| RW 2★ | Gapura | 1x1 | 3jt | 0 | 0 | +5 Viral each August |
| Kel 0★ | Kantor Kelurahan, Balai Desa | 2x2 | 20jt | 400rb, 350rb | 0 | PNS slots |
| Kel 0★ | Aspal Ulang | 2x2 | 4jt | 0 | 0 | counts as spent |
| Kel 1★ | Puskesmas Pembantu | 2x2 | 12jt | 300rb | 0 | +2 Popularitas |
| Kel 1★ | Pasar | 2x2 | 15jt | 250rb | 1,1jt | 2 parkir |
| Kel 1★ | BUMDes | 2x2 | 10jt | 150rb | 900rb | |
| Kel 1★ | Studi Banding | 2x2 | 2jt | 0 | 0 | a random wacana |
| Kel 2★ | Terminal | 3x3 | 25jt | 350rb | 1jt | shop boost, -1 Popularitas |
| Kel 2★ | Taman | 2x2 | 9jt | 200rb | 0 | +2 Popularitas, +1 Viral |
| Kel 2★ | Sawah Irigasi | 2x2 | 8jt | 100rb | 700rb | |
| Kel 2★ | Embung | 2x2 | 7jt | 80rb | 0 | banjir -30% |
| Kel 2★ | Desa Wisata | 2x2 | 11jt | 220rb | 800rb | +2 Viral |

## Left as they are

- Indomaret and Alfamart sit above the RT 1★ tier. They are the franchise jump and the balance bots are tuned around them, so they wait for the balance pass.
- Problem-gated buildings (Selokan, Fotokopi, Pos Satpam, Gudang Material, Kebun Sayur) answer a problem, not a star, so they stay cheap.
- Aspal Ulang and Studi Banding are spending for its own sake (they count toward Serapan), so their price is the joke.
- The balance bots (`balance`, `rw-bot`, `kel-bot`) pass with these numbers. A full balance pass by playtest is still open.
- No new art: the Kontrakan's row houses draw natively at 2x2, as the square buildings in #173 do.
- Hari had approved the ladder, not this table. Built at the owner's request; Hari reviews the table in the PR.
