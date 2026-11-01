# Staff as people: portraits, personal requests, quest chains, and the yearly price banner

From a design chat with voidinside99 on 2026-11-01. Inem's dream already makes one staff member feel alive; this gives everyone a face and wants of their own, as Kairosoft's staff have.

## 1. A face for everyone

- **Generic hires get a portrait** from the painter in `src/render/portraits.ts`, seeded by their staff id, so a person keeps their face for good.
- **The outfit says the job:**
  - Hansip: green uniform and beret
  - Petugas PU: orange vest and helmet
  - Supir: jacket and peci
  - Bendahara: batik
  - Admin Grup WA: hoodie and phone
  - Asisten: shirt and lanyard
  - Sekretaris: blazer
  - Tukang Tagih: waist bag and notebook
- **Specials keep their hand-picked looks**, and Inem keeps hers.

## 2. Urusan Pribadi: personal requests

- **When:** from level 2, each staff member brings a request about every 24 weeks. At most two are open across the staff, and each has a deadline.
- **How it looks:** a card led by their portrait, and a speech-bubble badge on their staff card until it is answered.
- **What they ask for:**
  - money (a loan or a one-off payment)
  - time (cuti: away for a few weeks)
  - training (a Bimtek course they choose)
  - experience (be sent on 3 send-events, or be ketua panitia at 17an)
  - a resource (Orang Dalam, Viral, Popularitas)
- **Akrab**, a bond of up to 3 hearts:
  - Saying yes gives +1 heart; each heart adds +3 to the work stat.
  - At 3 hearts the quirk upgrades (a special) or a perk unlocks (a generic hire).
  - Saying no takes a heart away and raises the poaching risk. A Baperan leaves at once.
- **Requests never block a star.**
- **Loans come back, or don't**, rolled on the borrower's Jujur:
  - repaid with interest
  - a flop, and the money is gone
  - for a side business, a chance it becomes a small shop on the map
- **Costs scale** with the week's income and the yearly price rise, so a request never empties the kas.
- **Traits tilt the asks:** Healing Mulu asks for cuti, Si Paling Grup WA for Viral, Titipan for Orang Dalam "for Pak Camat".

### The line bank (Indonesian first; English follows the same jokes)

They speak as people, in one breath: the ask, a reason, a sigh. Every line is 20 words or fewer, so it fits UI.md rule 13 as one paragraph. `{x}` is weeks, `{amt}` the price after inflation.

**Cuti**
- "Pak, saya mau ijin cuti {x} minggu. Mertua nginep nggak pulang-pulang, makannya banyak lagi. Stres, Pak."
- "Pak, KTP saya hilang. Kata kelurahan butuh tiga surat pengantar. Ijin {x} minggu ya, Pak."
- "Pak, burung saya masuk final lomba kicau. Ijin {x} minggu. Ini demi nama baik RT."
- "Pak, adik saya nikah, saya seksi konsumsi. Ijin {x} minggu, soalnya tendanya belum dibayar."
- "Pak, mau mudik. Tiketnya habis, jadi saya nunggu di terminal. Ijin {x} minggu, Pak."
- "Pak, anak saya wisuda TK. Pakai toga, Pak. Ijin {x} minggu, saya nggak boleh ketinggalan."
- "Pak, antre BPJS saya dapat nomor 347. Ijin {x} minggu ya, Pak."

**Pinjaman usaha**
- "Pak, boleh pinjam {amt}? Saya mau buka Martabak Matcha. Anak muda sekarang suka yang hijau-hijau."
- "Pak, pinjam {amt} buat ternak lele bioflok. Kata YouTube, tiga bulan balik modal."
- "Pak, saya mau buka jastip Korea. Modal {amt}. Sepupu saya kerja di bandara, Pak."
- "Pak, pinjam {amt} ya. Mau jualan kopi susu gula aren. Gerobaknya sudah ada, gulanya belum."
- "Pak, ada peluang bisnis. Modal {amt}, sebulan balik dua kali lipat. Pasti aman, Pak. Katanya."
- "Pak, pinjam {amt} buat frozen food. Kulkas di rumah sudah ada, tinggal isinya."
- "Pak, saya mau thrifting. Modal {amt}. Bajunya bekas Korea, harganya baru Jakarta."

**Loan outcomes**
- "Martabak Matcha laris. Utangnya lunas, plus {amt} buat kas."
- "Lelenya kabur waktu banjir. Utangnya... nanti ya, Pak."
- "Bisnisnya ternyata harus rekrut lima orang lagi. Uangnya hilang, temannya juga."
- "Jastipnya jalan. Kas dapat oleh-oleh: {amt} dan satu masker kertas."

**Bimtek**
- "Pak, saya mau kursus Bahasa Korea. Biar bisa kerja di Korea. Eh, maksudnya biar pintar, Pak."
- "Pak, ada sertifikasi juru ketik. Biayanya {amt}. Biar CV saya ada stempelnya."

**Experience**
- "Pak, kapan-kapan saya yang diutus ke kecamatan, ya. Saya sudah beli kemeja baru."
- "Pak, tahun ini saya mau jadi ketua panitia Agustusan. Sudah latihan pidato di kamar mandi."

**Resources**
- Orang Dalam: "Pak, anak saya nggak masuk zonasi. Rumah kami kurang dekat lima meter. Ada kenalan, Pak?"
- Viral: "Pak, cover dangdut saya sudah diupload. Tolong di-share ke grup, Pak. Biar viral."
- Popularitas: "Pak, saya mau dicalonkan Warga Teladan. Fotonya sudah saya siapkan dari tahun lalu."

**Saying no**
- "Ya sudah, Pak. Nggak apa-apa." (and they mean it a little less each time)
- Baperan: "Oh. Oke. Saya resign saja, Pak."

### UI.md rule 13

| Part of the card | Words |
| --- | --- |
| Name and role | 3 |
| The request line | 20 at most |
| Two buttons (e.g. "Kasih ijin · 3 minggu", "Nanti dulu") | about 8 |
| One consequence line (e.g. "Akrab +1. Dia pergi 3 minggu.") | about 7 |
| **Total** | **under 40** |

A request line that runs past 20 words splits in two. The ask stays on the card, and the reason waits behind a tap on the portrait as a speech bubble. Never two paragraphs on the card.

## 3. Quest chains for the named specials

Three steps each, like Inem's dream. Several need another special, which gives the staff an ensemble.

| Special | Chain | Payoff |
| --- | --- | --- |
| Pak Breaking | "Breaking Kampung": Viral 30, a studio (Balai Warga and Wifi), one scoop from a send-event | bad events are announced a week early |
| Pak Purna | his memoir "37 Tahun di Meja yang Sama"; needs Bu Juru Ketik to type it | Lobi +10 and a book-launch event |
| Bu Juru Ketik | her old typewriter repaired; needs Bang Rental PS | desk folders x2 |
| Bang Lawak | reunite his campus-radio trio: two lowongan finds among your warga | bad news lands softer across the kampung |
| Bro Kripto | invest the kas in "KampungCoin" | to the moon, or a rug pull and a scandal, on Jujur |
| Pak Kuis | host "Kuis Kampung" at 17an | a fourth 17an contest |
| Mbak Senam Pagi | a rekor kampung for the biggest senam: Lapangan and Popularitas 60 | Aman and Popularitas up for a season |
| Bang Rental PS | open a rental PS | a new shop, and a combo with Wifi |
| Om Lalu Lintas | a traffic light in the gang | a decor piece that eases the permit queue's drain |
| Bu Sinetron | a sinetron shoots in the gang: the road closed 2 weeks (Portal) | Viral, and every event that month "zooms in three times" |
| Mbak Gosip | unmask the anonymous gossip account | expose it (Popularitas) or recruit it (Viral) |
| Mas Konten | 100k followers through a prank series | Viral up; each prank costs some Popularitas |
| Om Motivasi | a "Kaya dari Iuran" seminar: a loan to rent the hall | iuran up, or a "seminar bodong" backlash, on Jujur |

## 4. The yearly price banner

From year 2, the year-end notice becomes a banner card: "PERHATIAN: Biaya hidup naik {x}% tahun ini." Under it sits one reason a year, from a bank, never the same twice in a row. The reasons target how an economy behaves, never a group of people, and pass the swap test (GAME-DESIGN.md section 5).

- "Rupiah melemah lagi. Kata pengamat, ini sehat."
- "Harga cabai naik. Cabainya sendiri juga kaget."
- "Minyak goreng langka. Raknya penuh, isinya pengumuman."
- "Harga sawit jatuh, minyak goreng tetap naik. Ekonom bingung."
- "Tarif parkir naik. Tukang parkirnya tetap yang sama."
- "Ongkir naik. Paketnya tetap sampai minggu depan."
- "Harga beras naik. Sawahnya di sebelah, berasnya dari jauh."
- "Gas melon langka. Antrenya panjang, tabungnya pendek."
- "Token listrik naik. Meterannya bunyi lebih sering."
- "Harga telur naik. Ayamnya belum diberi tahu."
- "Pajak kendaraan naik. Jalannya tetap berlubang."
- "Iuran naik. Rapatnya juga, tiap minggu."

The chat's example, "kebun sawit dijarah warga setempat", blames local residents. Those land conflicts are real and the residents are usually the weaker side, so it punches down. Its sawit idea is kept as the systemic joke above.

## Guardrails

- No requests about religion, ethnicity, disability, or a real person or brand. The polygamy example from the chat ("istri ke-4") is out for this reason; mertua, nikahan adik and wisuda TK carry the same "silly reason for leave".
- The satire is on the hustle economy (MLM, "pasti balik modal"), bureaucracy (three surat pengantar for a KTP) and prices, never on the people living with them.

Updates the docs: GAME-DESIGN.md section 4, the staff portraits, Urusan Pribadi, quest chains and the yearly banner.
