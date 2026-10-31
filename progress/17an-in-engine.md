# 17an fanfares, sounds and art, made in the engine

- `src/audio.ts`: eight 17an sounds (`Sfx17`): drumband fanfare, koplo sting, angklung call, slide whistle up and down, sack hop, kerupuk crunch, crowd cheer. New voices: filtered noise, a pitch-dropping drum, a bell, a reed, a flute and a slide.
- `src/render/agustus.ts`: the panjat pinang pole with its prize hoop, the day banner, bunting and umbul-umbul.
- `src/ui/lomba.ts`: the day plays the sounds and shows the banner and the drawn pole.
- `src/render/map.ts` and `agustusan` in `src/sim/lomba.ts`: bunting and umbul-umbul around the Kantor RT in July and August from year 2.
- `GAME-DESIGN.md`: a "Look and sound" line under Lomba Agustusan.
- Tests: `tests/lomba.test.ts` covers when the decorations go up and come down. The Lomba e2e passes at 320 and 412 in ID and 412 in EN; a run that loses the climb and the sack race played every sound with no page or console error.
- Details, limits and what was left out: `decisions/17an-in-engine.md`.
