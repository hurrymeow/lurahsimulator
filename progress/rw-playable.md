# RW playable

Shipped: the RW stage now plays end to end, and `playable` is on.

- RW combos run: Grup Chat Warga, Jalan Ditutup, Agustusan Akbar, plus the new Pos Siaga.
- RW jobs run: Kader Posyandu (decays without an Apresiasi) and Calo (buys stamps, risks a scandal).
- RW events run: Kerja Bakti, Musim Pindahan, Pendataan Warga.
- RW building effects run: Posyandu, Portal (ojol x0.7), Pasar Kaget (burst, 2 parkir), Gapura (August Viral and repaint).
- Buku Combo, Warga and the event popup list RW content once the player is in the RW.
- Tests: `tests/rw.test.ts` (unit), `tests/rw-bot.test.ts` (a fund-and-build bot reaches 2★ in 4 of 5 seeds), and an E2E that accepts the SK and opens the RW panels.
- Not done: RW 3★ balance is unchecked (it needs 2 AI RTs at 3★). Kelurahan is the next PR.
