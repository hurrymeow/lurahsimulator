# Smaller map T6: sheets and notices

Plan: `docs/plans/smaller-map.md`, task T6. DeepSeek wrote the Neighbours and Mutasi changes and ran out of turns. Claude finished the rest.

- **`src/sim/grow.ts` changed, though the plan's Don't touch list names it.** The promotion notice is chosen there, so the new Kelurahan text could not land without it. It is one line, and the plan missed this.
- **The rival's name is not translated.** `RIVAL_NAMES` holds proper names, as GAME-DESIGN.md treats Kampung Sebelah.
- **A Kelurahan notice of its own.** The RW and Kecamatan notices keep their text. The new one is 16 words in English and 15 in Indonesian, inside the plan's 20.
- **The Warga density cap covers English too:** 62 words in view and 488 in all. T5 measured it in Indonesian only.
- **English density still fails on other screens, not fixed here.** At 320, 412 and 430px, the event card's longest block is 21 words against a limit of 20, and at 412 or 430px Build tabs 2 to 4 run 2 or 3 words over their caps. T6 does not touch these screens, and English is not in CI.
