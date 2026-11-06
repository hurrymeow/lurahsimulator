# Playtest: RT 3★ to Kelurahan 1★

TODO item "Playtest the smaller map from RT 3★ to Kelurahan 3★ (T9)", the part that T7 handed over (RT 3★ to Kelurahan 1★). The owner asked for it to be played and for bugs to be fixed.

## How it was played
Two parts, following TESTING.md item 16 (agent runs hand back data; opinions are kept separate):
- **The nine player types** (GAME-DESIGN.md §8: idle, builder, shopkeeper, safety-first, cheapskate, Pencitraan, honest, random placer, hint reader) played seeds 1 to 6 with the scorecard bots, on main and on this branch. Their numbers for RT 3★ to Kelurahan 1★ are below.
- **A screen playthrough** in the style of the hint reader, who does what the screen says.

For the screen playthrough, the agent played the built app in Chromium at 360 x 640, in Indonesian, from the RT 3★ dev save. Each round reopened the game from the last save, read the screen (HUD, goal line, cards, Inem's notes) and acted as a player: it accepted the SK in Menu, followed Inem's notes, answered events with the free choice and built what the goal line asked. Time ran a week at a time and stopped at every card. Screenshots were read at each star and at every surprise.

This is an agent's playtest, not Hari's. It finds bugs, dead ends and confusing screens. It cannot say how the game feels.

## Bugs found and fixed
1. **A saved event card covered the home screen.** If the game was closed with an event waiting, the card appeared on top of the home screen, before Start, and blocked the Start button until answered. Cause: `App` showed a pending event in its constructor, skipping the rule that queued cards wait for a quiet moment with no home screen (`canShowQueued`). The frame loop already shows it once the home screen closes, so the constructor line is gone. E2e: "a pending event comes back after a reload, once the home screen is passed, never on top of it" (the old test expected the card over the home screen).
2. **At RT 3★ the goal line pointed away from the promotion.** With every star earned and the SK waiting in Menu, the line read "build Rumah for more beds". A player who closed the SK card had nothing on the map pointing back to it. The line now reads "accept the SK in Menu" (`goal.short.sk`) while an SK waits and promotion is possible.
3. **Kampung Sebelah came with no paths, so the first builds sat idle.** It joins with a Kantor RT, one Rumah and a single path tile between them. Inem's note said to build "beside the Kantor RT", and a Warung and a Rumah placed there showed "Tanpa jalan" and did nothing. It now gets the same free starter lanes as a new game's RT (`laySetapak`), and the notes say "beside a path". Path tiles count as no build, so the RW 1★ goal still needs 3 real builds. Unit test in `tests/grow.test.ts`.
4. **A game reopened during the Kampung Sebelah build step showed the home RT.** The note said to build "here", but the camera opened on the home RT. The note now pans to Kampung Sebelah once a session on the build step too, not only on the arrival.
5. **A building placed on a path could cut a whole street off.** Placing on a Jalan Setapak replaces it, by design (`decisions/simplify-build-menu.md`). Path tiles glow as free spots, and the suggested spot prefers them near the Kantor, so building there can silently cut the path that other buildings depend on. In the playtest, 18 Rumah placed near the Kantor removed 18 path tiles. Most of the RT lost its road: Popularitas fell to 0, residents fell from 87 to 55, and two quarterly reports showed large losses. The same trap hit the Kelurahan seed bot (`decisions/seed-roads.md`). A building may still replace a path tile, but not one that is another building's only way to the Kantor. The spot is refused with "This cuts the path to N buildings" (`cutBy` in `src/sim/access.ts`). A dead-end path tile can still be built over. Unit test in `tests/access.test.ts`. The extra check costs about 20 to 35 ms on a full-map placement check on the Kelurahan save. That check runs when a building is picked and once a game week while placing.

6. **An open RW combo goal sent the player off to build houses.** At RW 1★ the goal list said "find 1 RW combo", but its next step read "build Rumah for more beds" (`6-rw-combo-step-before.png`). `nextStep` only knew the RT combos. It now names the cheapest RW combo the player can set up, and a building it needs first: "combo Pos Siaga · First build Balai RW, then place side by side: Posyandu, Portal". In the screen playthrough, RW 2★ came at week 118. On the build before this fix, the same run sat on the combo goal for 216 weeks. Unit test in `tests/nextstep.test.ts`.
7. **Grup Chat Warga was listed under the RW combo goal, where it cannot happen.** It needs two AI RTs with the same trait, and since #303 the RW has none. It is now hidden from the goal's combo list and from the step while its rule cannot hold (`ruleCanHold`). It still shows in the Combo book.

## The nine player types, main against this branch
Median minutes at 1x to each star (seeds that reached it, of 6). The idle and cheapskate bots do not reach RT 3★ in 450 ticks on either side, which is allowed (§8 item 17).

| Bot | RT3 main | RT3 here | RW1 main | RW1 here | RW2 main | RW2 here | RW3 main | RW3 here | Kel1 main | Kel1 here |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| idle | — | — | — | — | — | — | — | — | — | — |
| builder | 13.4m (6/6) | 13.4m (6/6) | 14.2m (6/6) | 14.2m (6/6) | 19.2m (6/6) | 19.2m (6/6) | 21.3m (6/6) | 21.2m (6/6) | 28.0m (6/6) | 27.9m (6/6) |
| shopkeeper | 13.5m (6/6) | 13.5m (6/6) | 14.3m (6/6) | 14.3m (6/6) | 19.2m (6/6) | 19.2m (6/6) | 20.7m (6/6) | 20.6m (6/6) | 27.3m (6/6) | 27.3m (6/6) |
| safety | 13.7m (6/6) | 13.7m (6/6) | 14.5m (6/6) | 14.5m (6/6) | 19.2m (6/6) | 19.2m (6/6) | 21.3m (6/6) | 21.5m (6/6) | 27.9m (6/6) | 28.2m (6/6) |
| cheapskate | — | — | — | — | — | — | — | — | — | — |
| pencitraan | 13.7m (2/6) | 13.7m (2/6) | 14.5m (2/6) | 14.5m (2/6) | 19.2m (2/6) | 19.2m (2/6) | 21.3m (2/6) | 21.3m (2/6) | 27.9m (2/6) | 28.0m (2/6) |
| honest | 13.2m (6/6) | 13.2m (6/6) | 14.0m (6/6) | 14.0m (6/6) | 19.2m (6/6) | 19.2m (6/6) | 21.2m (6/6) | 21.3m (6/6) | 27.9m (6/6) | 27.9m (6/6) |
| random | 13.5m (5/6) | 13.5m (5/6) | 14.3m (5/6) | 14.3m (5/6) | 19.5m (4/6) | 19.7m (3/6) | — | 34.9m (2/6) | — | 42.0m (2/6) |
| hint | 14.6m (6/6) | 14.6m (6/6) | 15.4m (6/6) | 15.4m (6/6) | 23.4m (6/6) | 23.8m (6/6) | 24.4m (6/6) | 25.1m (6/6) | 31.1m (6/6) | 31.9m (6/6) |

- **Builder, shopkeeper, safety-first, Pencitraan and honest:** the same within 0.3 min.
- **Random placer:** reaches RW 3★ and Kelurahan 1★ in 2 of 6 seeds, against 0 on main, because it can no longer cut its own streets (fix 5). RW 2★ is reached in 3 seeds, against 4. Mixed, but better overall.
- **Hint reader:** 0.4 to 0.8 min slower from RW 2★ on (Kelurahan 1★ in 31.9 min against 31.1). The step now sends it to an RW combo first (fix 6). It was already the slowest type, so following the game's hints is a little slower still. Left for the scorecard item to judge.

Evidence: the bot timelines are from `BOT=<type> SEEDS=1,2,3,4,5,6 SCORECARD=1 npx vitest run tests/scorecard/run-one` on each side. Screenshots of the bugs are in `progress/playtest-rt3-kel1/`.

## Seen, not changed
- **Pace.** RW 1★ came 6 weeks after the promotion, under a minute at 1x. From the RT 3★ save, cash rose about 20jt a week and passed 800jt by RW 1★ plus 30 weeks. These are the known pace and cash rows (GAME-DESIGN.md §8 rows 7, 14 and 15, and the T9 notes in `decisions/smaller-map-balance.md`).
- **"Kantor RT ×2/1, limit reached"** in Build after Kampung Sebelah joins. Its Kantor counts toward the player's limit of 1, so the card reads as over the limit. Harmless, but odd.
- **Kampung Sebelah's nameplate** sits half under the goal pill after the arrival pan.
- **The goal "bring Kampung Sebelah to 3★" has no next step.** Its how-to line sends the player to Menu, Neighbours, where Kampung Sebelah's row reads "25 warga (punya 18)". That is clear once opened, but the goal list itself never says "build Rumah there". The screen playthrough built shops there instead and sat on this goal for 76 weeks. A step like the RW combo one would help. Logged as a TODO item.
- **"17 Agustus passed with no lomba, −8"** a week after loading the RT 3★ save. The save starts in July, after the prep window opened, so this comes from the dev save, not from play.
- **Inem says "Anda"** while the rest of the game says "kamu". That is her voice as the polite assistant, so it is left as it is.

## Opinions (agent, not data)
- Once a goal names its next build, the RW reads well: build in Kampung Sebelah, then a named combo, then Kampung Sebelah's stars.
- Money stops mattering early. From RT 3★ the kas only grows, so every choice priced in rupiah is free.

## Verdict
Self-approved under the TODO rule. GAME-DESIGN.md §8 row 1 ("Always a useful next move") is better served by fixes 2, 3 and 6, and no player type got slower except the hint reader, as noted above. Fix 5 serves the rule "Bad choices slow you down. They never soft-lock the game." UI.md item 24 ("Every goal says how") is met by fix 2. TESTING.md: unit tests for fixes 3, 5 and 6, an e2e test for fix 1, and the existing goal and tutorial e2e tests still pass.

Left for a person: Hari's own playtest, for how it feels.
