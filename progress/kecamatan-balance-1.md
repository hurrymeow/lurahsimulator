# Kecamatan balance pass 1

- Pinjol idle rule changed to most members idle. Test added.
- Kecamatan crowd weight 0.1 per resident (`NEEDS.aman.perResidentKec`).
- Kecamatan bot library added (`tests/kec-bot-lib.ts`) and the Kelurahan bot split into `tests/kel-bot-lib.ts`. The Kecamatan run is skipped unless `KEC_BOT=1`.
