# Playtest bot gaps T4

Changed `tests/kec-bot-lib.ts`: imported `fedBase` and `households` from `src/sim/needs`, and in `kecWeek`'s Kecamatan stage built a Toko Kelontong (then a Warung if nothing was placed) whenever feeding fell short of households, holding off on new homes meanwhile. Typecheck, the full unit suite and `tests/kec-bot.test.ts` pass.
