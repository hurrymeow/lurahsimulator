# Playtest: RT 3★ to Kelurahan 1★

TODO item "Playtest the smaller map from RT 3★ to Kelurahan 3★ (T9)", the part that T7 handed over (RT 3★ to Kelurahan 1★). The owner asked for it to be played and for bugs to be fixed.

## How it was played
The agent played the built app in Chromium at 360 x 640, in Indonesian, from the RT 3★ dev save. Each round reopened the game from the last save, read the screen (HUD, goal line, cards, Inem's notes) and acted as a player: it accepted the SK in Menu, followed Inem's notes, answered events with the free choice and built what the goal line asked. Time ran a week at a time and stopped at every card. Screenshots were read at each star and at every surprise.

This is an agent's playtest, not Hari's. It finds bugs, dead ends and confusing screens. It cannot say how the game feels.

## Bugs found and fixed
1. **A saved event card covered the home screen.** If the game was closed with an event waiting, the card appeared on top of the home screen, before Start, and blocked the Start button until answered. Cause: `App` showed a pending event in its constructor, skipping the rule that queued cards wait for a quiet moment with no home screen (`canShowQueued`). The frame loop already shows it once the home screen closes, so the constructor line is gone. E2e: "an event saved while open waits for Continue".
2. **At RT 3★ the goal line pointed away from the promotion.** With every star earned and the SK waiting in Menu, the line read "build Rumah for more beds". A player who closed the SK card had nothing on the map pointing back to it. The line now reads "accept the SK in Menu" (`goal.short.sk`) while an SK waits and promotion is possible.
3. **Kampung Sebelah came with no paths, so the first builds sat idle.** It joins with a Kantor RT, one Rumah and a single path tile between them. Inem's note said to build "beside the Kantor RT", and a Warung and a Rumah placed there showed "Tanpa jalan" and did nothing. It now gets the same free starter lanes as a new game's RT (`laySetapak`), and the notes say "beside a path". Path tiles count as no build, so the RW 1★ goal still needs 3 real builds. Unit test in `tests/grow.test.ts`.
4. **A game reopened during the Kampung Sebelah build step showed the home RT.** The note said to build "here", but the camera opened on the home RT. The note now pans to Kampung Sebelah once a session on the build step too, not only on the arrival.
5. **A building placed on a path could cut a whole street off.** Placing on a Jalan Setapak replaces it, by design (`decisions/simplify-build-menu.md`). Path tiles glow as free spots, and the suggested spot prefers them near the Kantor, so building there can silently cut the path that other buildings depend on. In the playtest, 18 Rumah placed near the Kantor removed 18 path tiles. Most of the RT lost its road: Popularitas fell to 0, residents fell from 87 to 55, and two quarterly reports showed large losses. The same trap hit the Kelurahan seed bot (`decisions/seed-roads.md`). A building may still replace a path tile, but not one that is another building's only way to the Kantor. The spot is refused with "This cuts the path to N buildings" (`cutBy` in `src/sim/access.ts`). A dead-end path tile can still be built over. Unit test in `tests/access.test.ts`. The extra check costs about 20 to 35 ms on a full-map placement check on the Kelurahan save. That check runs when a building is picked and once a game week while placing.

## Seen, not changed
- **Pace.** RW 1★ came 6 weeks after the promotion, under a minute at 1x. From the RT 3★ save, cash rose about 20jt a week and passed 800jt by RW 1★ plus 30 weeks. These are the known pace and cash rows (GAME-DESIGN.md §8 rows 7, 14 and 15, and the T9 notes in `decisions/smaller-map-balance.md`).
- **"Kantor RT ×2/1, limit reached"** in Build after Kampung Sebelah joins. Its Kantor counts toward the player's limit of 1, so the card reads as over the limit. Harmless, but odd.
- **Kampung Sebelah's nameplate** sits half under the goal pill after the arrival pan.
- **"17 Agustus passed with no lomba, −8"** a week after loading the RT 3★ save. The save starts in July, after the prep window opened, so this comes from the dev save, not from play.
- **Inem says "Anda"** while the rest of the game says "kamu". That is her voice as the polite assistant, so it is left as it is.

## Verdict
Self-approved under the TODO rule. GAME-DESIGN.md §8 row 1 ("Always a useful next move") is better served by fixes 2 and 3. Fix 5 serves the rule "Bad choices slow you down. They never soft-lock the game." UI.md item 24 ("Every goal says how") is met by fix 2. TESTING.md: unit tests for fixes 3 and 5, an e2e test for fix 1, and the existing goal and tutorial e2e tests still pass.

Left for a person: Hari's own playtest, for how it feels.
