# More buildings that raise Popularitas

Hari: the player builds Pos Ronda again and again for hearts, so the town looks the same.

Audit of Popularitas per month before this change, RT stage: Pos Ronda +2 (0★), Pohon Rindang +0.3 (1★), Barbershop +0.3 (1★), Lapangan +0.5 (2★, 2x3), Bank Sampah +0.5 (2★), Apotek +0.5 (3★). Kos-kosan -1, Kandang Ayam -0.3 and the tukang parkir -0.25 take it away. RW and Kelurahan add Portal +1, Posyandu (+1 to each neighbour RT), Puskesmas Pembantu +2 and Taman +2. Pos Ronda was the only strong source an RT had.

Three new social buildings, one per RT star, each a different size, price and catch:

| Building | Unlock | Size | Cost | Upkeep | Income | Popularitas | Catch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Praktik Bidan | RT 1★ | 1x1 | 1.8jt | 20rb | 80rb | +1.5 | Costs 1 Orang Inside to place (the practice licence) |
| Panggung Senam | RT 2★ | 2x2 | 3.2jt | 60rb | 0 | +2.5, +0.3 Viral | Big lot, no income |
| Kolam Pancing | RT 3★ | 2x2 | 5.5jt | 120rb | 150rb | +3 | Dear, and its income barely covers its upkeep |

- Pos Ronda keeps its numbers. It stays the cheap early source; the new ones beat it on hearts per lot or add something it lacks.
- Taman Bermain, Kolam Ikan Hias and the other cut decorations stay cut (`src/data/decor.ts`). The new buildings have new art.
- A langgar was suggested. It is left out: CONTRIBUTING.md bars religious jokes, and every building here needs a joke that moves a number.
- Blurbs stay within 25 words in both languages. New art follows ART.md: palette keys, `box`, `roof` and `ground`, the ink pass, native 1px edges on the 2x2 lots. Panggung Senam paints its open deck in native pixels, because `box()` leaves the back corner of a top face to the roof that usually covers it.
- The economy and bot tests pass unchanged.
- Picked without Hari's sign-off first, at the owner's request. Hari reviews the set in the PR.
