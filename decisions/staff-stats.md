# Staff stats: obvious and decisive

TODO: "Make the four staff stats obvious and decisive". Ideas from a chat with voidinside99, approved by Hari on 2026-10-31. Before, each role read one stat that only scaled its output. Rajin drove four roles, Jujur only showed as two hidden penalties, and the player could not see what a stat bought.

## 1. One meaning and one icon per stat

| Stat | Always means | Icon |
| --- | --- | --- |
| Rajin | how much gets done | a broom |
| Lobi | how smoothly things go through the people above | a handshake |
| Jujur | how much leaks | scales |
| Gaul | how liked | a speech bubble |

The icons are drawn by hand in `src/render/stat-art.ts`, in the same inks as the HUD icons.

## 2. Two stats per role: work and risk

Each role keeps its work stat and gains a different risk stat. Below 60 in the risk stat, a mishap can strike each week, at 8% x (60 − stat) / 60. Jujur 30 is about 4% a week, roughly one every half year; 60 or more never. The notice names the person, the stat and its value.

| Role | Work | Risk | Mishap |
| --- | --- | --- | --- |
| Asisten | Lobi | Jujur | a titipan folder jumps the queue, −2 Popularitas |
| Hansip | Rajin | Gaul | a scuffle with warga, −2 |
| Tukang Tagih | Rajin | Jujur | skims the iuran, Rp 150rb |
| Petugas PU | Rajin | Jujur | pads the materials bill, Rp 250rb |
| Admin Grup WA | Gaul | Jujur | a hoax in the group chat, −3 |
| Supir | Rajin | Gaul | clips a gerobak, −1 |
| Bendahara | Jujur | Rajin | the receipts go missing, Rp 300rb |
| Sekretaris | Lobi | Jujur | a small scandal, −3 |

The two old hidden penalties are gone: the Tukang Tagih with Jujur under 40 kept 10% of the iuran, and the Bendahara with Jujur under 40 kept half the upkeep savings. Both are now named mishaps. The trade-off it aims for: a high-Lobi, low-Jujur Sekretaris is powerful and a liability.

## 3. The math is on screen

- A staff card says what its work stat buys: "Lobi 60 → 1 berkas per minggu".
- The detail view labels the two stats the job uses, "kerja" and "risiko", each with its effect; the other two are greyed and say the job does not use them.
- An applicant shows what they would do in the posted role and their risk: "Sebagai Asisten: 0,8 berkas per minggu · 3% per minggu: berkas titipan menyerobot antrean".
- Mishap and send results name the person and the stat.

## 4. Who do you send?

A choice can send one of your staff. The card lists the best three for the stat, each with the stat and the odds: base + (stat − 50) x 1.2%, from 5% to 95%. A success teaches them a point of the stat.

- Telepon dari Kecamatan (Lobi, only while permits wait): 4 folders stamped, or a new form.
- Warga di Gerbang (Gaul): +5 Popularitas, or −5 and a video.
- Hibah Tunai (Jujur): the whole hibah booked, or 30% of it and −3.
- Atap Bocor (Rajin): +4, or half the roofs and a tarpaulin bill.
- Tim Audit (Lobi, a third choice): a clean audit, or every missing receipt costs double.

**Lowongan:** a Grup WA posting goes out through your Admin Grup WA. Their Gaul moves points of the odds from 2★ to 3★ applicants: (Gaul − 50) x 0.4, at most 20 better or 10 worse. The channel says so.

## 5. Training picks the stat, and work teaches

Bimtek offers a course for each stat: Pelatihan Kedisiplinan, Workshop Networking ke Bali, Diklat Antikorupsi and Pelatihan Pelayanan Prima. Each is +5 and a week away. The anti-corruption course costs 1.5 times the others, which is the joke. Every level-up adds 2 to the work stat, and a successful send adds 1 to the stat it used.

## 6. Traits name what they bend

Trait chips show their stat changes with the stat icons ("Gaul +15", "Jujur −10"), and output or level-speed changes ("hasil ×0,8").

## Not done

- Speech bubbles with the stat icon over staff walkers on the map, when a stat triggers. Staff do not walk the map as themselves yet.
- More send events (banjir, the 17an ketua's odds per contest).

Updates the docs: GAME-DESIGN.md, the staff stats, roles, mishaps, send events, lowongan and Bimtek lines.
