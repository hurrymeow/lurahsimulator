# Big buildings read wide, not tall

From Julian's playtest to SK 2 (`decisions/playtest-sk2.md`): Gudang Material and Koperasi looked like a Rumah scaled up. ART.md already said a 2x2 is no taller than a 1x1 of its tier; the code did not follow it.

## Cause

`Painter(n)` scaled heights by n with everything else, so every 2x2 came out twice as tall as the same art on one tile. Koperasi stood 25px over its lot, Kontrakan 26, Kantor Kelurahan 38; the tallest 1x1 building at level 1 stands 14.

## What changed

- `Painter.low()`: heights, wall rows and wall columns in native pixels; the footprint keeps its n. The sprites keep their one-tile code, so each big building is now exactly as tall as its 1x1 version and wider: windows keep their size and repeat along the wall, the roof runs long and low. Every other sprite renders byte for byte as before (276 renders compared).
- Low: Koperasi, Gudang Material, Kontrakan, Balai Warga, Panggung Senam, PAUD, Balai RW, Kantor Kelurahan, Puskesmas Pembantu, Pasar, Terminal, Kantor Kecamatan, Pos Satpol PP, Koperasi Simpan Pinjam, Balai Latihan Kerja.
- Made low, several read as a big tent: a wide roof over 6 to 8 rows of wall. Their walls and roof pitch went up by 2 to 7 pixels, still under the bar: they now stand 4 to 13 over their lots. Terminal gained a long blue canopy roof in place of its flat slab.
- Measure: height above the back corner of the lot. Measured from the ground centre, a 2x2 is penalised 8px for its depth alone.
- Exceptions, tall by what they are: the wifi tower, the baliho, and the parks with trees (Taman, Taman Kota).
- Site sprites: the stakes are drawn in native pixels for any lot, with a stake per tile along each side; the scaffold is low. Long lots (1x2, 2x3) already used one-tile site sprites per tile. The crane is gone since #256.

## Checks

- `tests/art.test.ts`: no 2x2 or 3x3 stands taller over its lot than the tallest 1x1 building at the same level; the stakes and scaffold have no 2x2 block of one colour at 1x1, 2x2 and 3x3. Both fail on the old art (checked).
- Judged against ART.md and UI.md rule 17 (art stays in its footprint): the low art fits its lot; screenshots at 412px of every big building, a permit plot and a building site.
