# Smaller map T5: the flip to the new ladder

Plan: `docs/plans/smaller-map.md`, task T5. DeepSeek wrote the map, absorb, goals and rival scale. Claude finished it, because the bots missed their stars.

## Goal changes the plan did not list

These change GAME-DESIGN.md section 3, so voidinside99 is asked to confirm them on the PR.

1. **RW 2★ asks for 1 RW combo, not 2. RW 3★ now asks for 2.** At RW 1★ only Pos Siaga and Grup Chat Warga are open, and Grup Chat Warga needs two AI RTs side by side. The new RW has one AI RT, so a second combo could not be reached before 2★: every bot stayed at 1★ on every seed. Jalan Ditutup and Agustusan Akbar open at 2★, so 2 combos fits 3★. Grup Chat Warga stays on the RW's list and fires at the Kelurahan (decision 9 in the plan).
2. **Kelurahan 1★ asks for 80% Serapan for 48 weeks, not 12.** With Kampung Sebelah absorbed and RW 2 at 1★ early, every bot reached 1★ at week 22, under the band's week 48 floor. 48 weeks holds the band without moving it. This is a first pass; T8 can tune it.

## Tests changed

- `tests/grow.test.ts`, `tests/higher.test.ts`, `tests/rw.test.ts`: the new grid, absorb and goals (DeepSeek).
- `tests/rw-bot.test.ts`: the bot builds each RW building once, then funds. It used to keep buying duplicates and fund down to Rp 3jt, so with one RT it never reached the Rp 6jt it asked for before building Pasar Kaget. The two titles now say what the tests check. The bars did not move.
- `tests/kel-bot-lib.ts`: the bot pays Rp 1,5jt for its first clean audit on Tim Audit, as a player chasing that goal would. Showing everything is clean only with no stale wacana, and the bot's Studi Banding always leaves one. The bars did not move.
- `src/sim/seeds/rw.json`, `src/sim/seeds/kel.json`: regenerated.
- `tests/e2e/ui.spec.ts`: 1 neighbour row, not 3. The frame-rate test fills 2x2 RTs with 3 AI cells and clears `noRoad`, see below. The Warga screen gets a capped allowlist entry (`wordsAll` 486, `wordsInView` 60), because Kampung Sebelah's residents now join its list.

## For T8

- No pacing band moved. All bots are inside the bars in `tests/rw-bot.test.ts` and `tests/kel-bot.test.ts`.
- **Stempel barely matters at the RW.** With one AI RT, the backlog stayed clear for 144 weeks on every seed.
- **The rival is too weak at the Kelurahan.** Before the fixes above, the Kelurahan bot beat it about 5x (3697 to 681 at week 96) and won 8 of 8.
- **Popularitas sinks past 300 residents.** The bots keep growing on the absorbed land, and at 318 to 395 residents Popularitas is 33 to 43, under the 2★ bar of 45.
- **Rupiah explodes at the Kelurahan.** Rp 200jt at week 192, up to Rp 35 miliar at week 672.
- **Money is tight at the RW, and trait decides who catches up.** On Auto-dana with the old bot routine, Hobi Wacana seeds stalled at Kampung Sebelah 1★ with 21 to 29 builds in 9 years. A Jarang seed passed 100 builds.
- **The Kelurahan seed opens with 226 residents**, up from 97, because Kampung Sebelah's warga join at promotion. That already passes the 200 that 3★ asks for, so T8 should check that goal.

## Frame rate

The frame-rate test fell to about 1 fps. The cause is not the smaller map: each `noRoad` building draws through `ctx.filter`, and Kampung Sebelah's land makes the test's unlinked checkerboard the player's. At 412px under the 6x throttle, 41 such buildings gave 0.9 fps, the same scene with none gave 13.4, and the real Kelurahan seed (354 buildings, none without a road) gave 12.9. The test now clears `noRoad`. The slow grey draw is older than this work and is a separate fix.
