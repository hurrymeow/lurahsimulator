# Name plate styles per building, and Puskesmas Pembantu becomes RSUD (2026-11-09)

Koko reviewed every sprite with a name plate (options sheet: `docs/plans/plate-styles-rsud/`) and picked a style per building:

- **Emblem** (a 5x5 pictogram instead of the word): Taman, Taman Kota, Koperasi Simpan Pinjam, Kantor Kecamatan, Kantor Kelurahan, BLK. The word covered the door, porch or path on these.
- **Raised on the roof** (the word on a board on two posts above the roof): Pasar, Terminal, Pos Satpol PP. The posts sit inside the plate's span on the building, so they always land on the roof and never stand in the air past the building's edge (Koko's note on the Satpol render).
- The height rules (a level grows at most 8px over its level 1, and stays at or under 28px; `tests/art.test.ts`) limit how high a plate can go. So Pasar level 1 now carries a raised plate too, which lets levels 2 and 3 stand theirs higher. The Terminal plate stands over the front platform canopy, because over the office roof it was 7px over the rule.
- **Puskesmas Pembantu → RSUD (Rumah Sakit Umum Daerah).** Only the displayed name changes (`name: 'RSUD'`). The id stays `puskesmasPembantu`, so saves, the health-post check and the combos keep working. The sprite is redrawn as a kabupaten hospital: whitewashed storeys with a green band, a red cross, an IGD canopy, ambulances, and a three-storey main block at level 3.
- Dropped option: the slim band plate.

Updates the docs: ART.md (Building levels: plate styles, RSUD) and GAME-DESIGN.md (the Puskesmas Pembantu mentions now say RSUD).
