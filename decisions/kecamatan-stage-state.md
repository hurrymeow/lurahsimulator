# Kecamatan stage and state (slice task 1)

- `kecamatan` is a stage after Kelurahan. It keeps the Kelurahan tile map (`STAGE_SPAN.kecamatan = 4`). The other three Kelurahan are modelled in `GameState.kec.districts`, not drawn as tiles.
- No save version bump. `deserialize` fills `stars.kecamatan = 0`; `kec` is created on promotion only.
- Both the Kelurahan and Desa paths promote into Kecamatan. The plan did not say; this is the simpler reading.
- A Kelurahan save already at 3★ is offered the SK on the next weekly tick, because it never got one before.
- Districts: traits rotate with the seed (no RNG). Progress per week by trait, star bars at 90, 200 and 340 weeks. First pass; Bantuan will add progress in task 3.
- `pinjolUnder` is the one goal met from below. `GoalProgress.under` carries that.
- Goal lines for pinjol, Aman and razia read state that tasks 2 and 3 fill. Until then pinjol reads 0%.
- `RIVAL_SCALE.kecamatan = 10`, rival "Kecamatan Sebelah". Placeholder for the bots in task 6.
