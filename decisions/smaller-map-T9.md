# Smaller map, T9: the verdict

TODO item "Playtest the smaller map from RT 3★ to Kelurahan 3★ (T9)", `docs/plans/smaller-map.md` T9. The item now closes on the agent's verdict (TODO.md's Approval rule): bot runs, the Nightly scorecard and CI stand in for a person. The two agent playtests of the range are `decisions/playtest-rt3-kel1.md` (#323) and `decisions/playtest-kel.md` (#327), with nine fixes. This file checks the six "Open notes" in `decisions/smaller-map-balance.md` against today's main and gives the verdict.

## Evidence
- **The six player types that climb** (builder, shopkeeper, safety-first, Pencitraan, honest, hint reader) on seeds 1 to 6, from RT 0★ to Kelurahan 3★: `BOT=<type> SEEDS=1,2,3,4,5,6 SCORECARD=1 npx vitest run tests/scorecard/run-one`, on main at 61cfd4e. The idle, cheapskate and random bots do not climb that far and are not used for stage lengths.
- **The Kecamatan bot** (`KEC_BOT=1 SEEDS=3,4 npx vitest run tests/kec-bot.test.ts`) for the Kecamatan notes.

Minutes are at 1x (8 s a week).

| Bot | RW length | Kelurahan length | Kel 1★ | Kel 2★ | Kel 3★ |
| --- | --- | --- | --- | --- | --- |
| builder | 7.1 to 9.3 | 15.2 to 16.9 | 28.1 to 29.9 | 33.1 | 38.4 |
| shopkeeper | 7.3 to 11.7 | 13.7 to 17.3 | 27.7 to 31.6 | 33.1 | 38.4 |
| safety-first | 7.9 to 8.0 | 16.8 to 17.3 | 27.7 to 28.3 | 33.1 | 38.4 |
| Pencitraan | 6.9 to 8.5 | 16.9 to 18.3 | 26.8 to 28.1 | 33.1 | 38.4 |
| honest | 6.9 to 11.7 | 15.7 to 19.1 | 28.1 to 32.4 | 33.1 | 38.4 (44.8 on seed 4) |
| hint reader | 7.1 to 7.6 | 16.4 to 16.8 | 28.3 to 28.7 | 33.1 | 38.4 |

## The six notes
1. **Stage lengths are short of target.** Still true: the RW takes 7 to 12 min (target about 20) and the Kelurahan 14 to 19 min (target about 30). This is a pacing call, not a bug. The scorecard tracks it (rows 7 and 10) under the TODO item "Fix the remaining scorecard Fails that have a clear cause". Not changed here.
2. **Kel 2★ and 3★ land at the same minute for every bot.** Traced. They land at 33.1 and 38.4 min for every bot and seed but one. Kel 2★ needs one yearly area ranking win and Kel 3★ needs three, and tier-win goals count only the yearly ranking, every 48 weeks (GAME-DESIGN.md "Tier-win goals"). So the calendar sets those two stars, not play: once a bot is ahead of Kelurahan Sebelah, it waits for the next yearly ranking. Since #327 the goal pill says "yearly" and every ranking card says whether it counts, so the player sees why. Whether a stage should wait on the calendar is a design call, logged with note 1.
3. **Preman can sink Aman at the Kecamatan.** The game does show it: a card when a warga turns preman ("A Satpam post would put him to work"), the preman problem notice, the Aman warning, the building panel's "a preman takes uang keamanan here", and the meter line. But the Kecamatan's Aman goals said only "raise Aman with Pos Satpol PP, Pos Ronda, street lights and jobs", leaving out the biggest lever: each preman costs 4 Aman, and a Pos Satpam turns one into the guard. **Fixed:** both Aman goal lines (`goal.how.amanNow`, `goal.how.amanWeeks`) now lead with it: "give each preman a Pos Satpam job, then add Pos Satpol PP, street lights and jobs".
4. **The bot runs do not use the road rule.** Still true. `tests/setup.ts` turns it off for every test, the scorecard included, so bot buildings work without a path and the bots have more room than a player. Logged as a TODO item: run the scorecard with the road rule on.
5. **The Kecamatan has long waits between goals.** Still true, and traced. On seeds 3 and 4 the Kecamatan bot reaches 3★ in 425 weeks after promotion (56.7 min), inside the 45 to 70 min band. Its stars land at weeks 113 or 186, then 250 and 425 on both seeds. The longest wait between two goal lines is 175 and 173 weeks (about 23 min). As at the Kelurahan, the last stars wait on yearly ranking wins (1 for 2★, 3 for 3★), so the calendar sets them. Logged with note 1.
6. **The Kelurahan dev seed opens with more residents than its goals ask for.** A debug start, not play. The residents goals themselves were judged and kept (`decisions/kel-residents-goals.md`). Nothing to change.

## Verdict
**The smaller map is playable end to end, and T9 is done.** Every climbing bot reaches Kelurahan 3★ on every seed. The agent playtests found and fixed nine bugs (#323, #327). This file closes the clear gap left: the Aman goal now names the preman fix. What remains is pacing (RW and Kelurahan are about half their targets, and two Kelurahan stars wait on the yearly ranking) and harness realism (the road rule). Both are logged as TODO items rather than tuned here, because they change the whole ladder's balance.

Self-approved under the TODO rule: GAME-DESIGN.md §8 through the bot numbers above, UI.md item 24 ("Every goal says how") through the Aman line, and TESTING.md through the goal-text unit tests.
