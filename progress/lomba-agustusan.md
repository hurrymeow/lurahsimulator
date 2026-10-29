# Lomba Agustusan

- `src/data/lomba.ts` (contests, stages, numbers); `src/sim/lomba.ts` (prep, odds, the system, prizes); `src/ui/lomba.ts` (panitia panel, the day screen with the Panjat Pinang and Balap Karung mini-games).
- The old `agustusan` event is removed (data, Indonesian strings, its tests). The visual test's event card now shows Harga Cabai, so the baseline is redrawn.
- The tick waits while the day is due. The app opens the day at a quiet moment and holds time. Random events keep clear of the day.
- The trophy sprite `piala` is drawn on the Kantor RT. Inem's gig completes from the dangdut stage (`inemHeadlined`).
- Tests: unit (schedule, pay and refund, cap and Lapangan, stage, ketua stats, skip, time waits, prizes, trophy, crowd, gig); e2e full flow at 320/360/430 id and 320 en.
