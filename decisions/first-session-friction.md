# First-session friction: 2 taps to the map, Bangun primary until the first build, an effect line on build cards

TODO item "Small first-session friction" (agent playtest 2026-11-25, #484).

## What changed
1. **Two taps to the map.** With no save, Mulai goes straight to naming. The Continue / Game baru choice shows only when there is a save to continue or overwrite. A new player now taps Mulai, then Mulai on the naming screen (it was Mulai, Game baru, Mulai).
2. **Bangun is the primary button until the first build.** Cara main says "Ketuk Bangun", but the green button was Menu. While nothing has been bought (`stats.spent === 0`), Bangun is primary and Menu is plain. After the first purchase they swap back. There is still one primary on screen (UI.md rule 14).
3. **Each build card names its effect**, from the building's own numbers:
   - weekly income ("+250rb" after the coin icon), and Popularitas ("+2" and the heart), at most two tokens;
   - for a building that only draws people, the warga icon, with "Menarik warga" in its label;
   - houses keep their bed count, as before.
   Sheets already show "Rp" and "Popularitas" as their icons. A first version added "/mgg" and the words. That put two Build tabs at 53 words in view, over rule 13's 50, so the card shows numbers only, like the HUD's weekly pops. The words are in the label.

## Tests
- **e2e:** the home test checks that Mulai skips the choice with no save, and that Bangun is primary and Menu is not after starting. The shared `start` helper and the visual, screen-bot and T2 specs click Game baru only when it shows. The centring and screenshot tests skip the choice screen that no longer appears with no save.
- **Unit:** `tests/build-effect.test.ts` checks the effect line for a shop, a Popularitas building, a draw-only building and a house.
- 180 e2e tests (home, build, coach, density, legibility, centring) pass at 320 id and 412 en. `npm run typecheck` and `npm test` pass.
- Screenshots at 320 id were checked by eye: the dock, and the Hunian, Toko and Fasilitas tabs.

## Verdict
Self-approved under the TODO rule (UI.md rules 13, 14 and 16; CONTRIBUTING.md). Done-when met: a new player reaches the map in 2 taps, Bangun is primary until the first build, and each build card names its effect.
