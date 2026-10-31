# Kecamatan responses (slice task 3)

- **Razia Satpol PP** is a button on the Wacana sheet, shown in the Kecamatan only. It needs a working Pos Satpol PP and 1 Orang Inside. Aman +8 for 8 weeks, Popularitas −3, half the households in debt and half on judol are cleared and their share is added to the three modelled Kelurahan. The Satpol PP role adds `ROLE_FX.satpol.raziaAmanPerLevel` Aman per level while it runs.
- The cases that move are taken from the longest debts first. The plan said "half the cases move to the next Kelurahan"; the three Kelurahan take them in turn, not one.
- **Literasi Keuangan** is the Realisasi of a new Wacana, **Spanduk Anti Judol**. Rp 3jt, lands after 8 weeks, cuts new pinjol and judol cases by 50% for 48 weeks. Both are offered only in the Kecamatan (`stage` field on the data).
- **Spanduk Anti Judol** costs the usual announcement fee and Rp 60k a week while the approval lasts. It moves the Laporan and Popularitas and nothing real, like every Wacana.
- The 3★ razia line reads `weeksSinceRazia`: the weeks since the last razia, or since promotion if there was none.
