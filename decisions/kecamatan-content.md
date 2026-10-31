# Kecamatan content (slice task 4)

- Six buildings, four combos, six events and the Satpol PP role, in `src/data/higher/kecamatan.ts`, with Indonesian text in `higher-id.ts` and `id-content.ts`.
- Open at promotion: Kantor Kecamatan, Pos Satpol PP, Koperasi Simpan Pinjam, Balai Latihan Kerja. Koperasi and Balai open early because the 1★ goal needs pinjol under 25%. Baliho and Taman Kota open at 1★, with Iklan Bertarget.
- Each building does something the engine reads:
  - Pos Satpol PP: Aman +4 (`fx.aman`, read in `needs.ts`).
  - Koperasi Simpan Pinjam: new pinjol cases −25% each, two count (`PINJOL.koperasiCut`).
  - Balai Latihan Kerja: restarts the idle time of one idle warga a week (`fx.retrain`).
  - Baliho: +0.5% a week to the judol start chance each (`JUDOL.balihoStart`), plus its Virality.
  - Taman Kota: Popularitas and a shop boost, like Taman Bermain.
- Events are plain random events with a free first choice. None reads pinjol state, so they carry flavour and small trades, not mechanics.
- Satpol PP role: Rajin drives it, Gaul is its risk. `ROLE_FX.satpol.raziaAmanPerLevel` waits for the razia in task 3. In the Kecamatan the outside channel gives 5% 5★ applicants, taken from its 4★ odds.
- Open question left for Hari: the Baliho judol ads are described in the blurb only. Showing them on the sprite is not done.
