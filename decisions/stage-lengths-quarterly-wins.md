# Stage lengths, and stars that no longer wait on the calendar

TODO item "Stage lengths, and stars that wait on the yearly ranking" (sources: `decisions/smaller-map-T9.md`, notes 1, 2 and 5).

## What was wrong
- **The calendar set three stars.** RW 2★ needed 1 yearly ranking win, Kel 2★ a clean Tim Audit (it comes each March) and Kel 3★ 3 yearly wins. So RW 2★ landed at week 144, Kel 2★ at week 248 and Kel 3★ at week 288 for nearly every bot and seed.
- **The ranking never tested play from the RW on.** Every climbing bot beat the rival about 2:1 in every quarter of the RW and Kelurahan. A "win N rankings" goal only counted time.
- **The stages were short.** RW 7 to 12 min (target about 20) and Kelurahan 14 to 19 min (target about 30). Act 1 ended at 38 min against Hari's "near 52 min" (GAME-DESIGN.md band table).

## What changed
1. **Tier-win goals count every ranking won in the stage**, as `rankWins` does at the RT. The yearly-only rule goes, with its "yearly" goal text and the line on each ranking card. Counts: RW 2★ **4**, RW 3★ **8** (new line), Kel 2★ **8**, Kel 3★ **14**, Kec 2★ **4**, Kec 3★ **12**.
2. **The clean Tim Audit moves from Kel 2★ to Kel 3★.** It comes each March, so at 2★ it set the star's week. At 3★ it is one line among several and comes well before the 14th win.
3. **The rival is stronger from the RW on:** `RIVAL_SCALE` RW 2.2 to **3.6**, Kelurahan 3.8 to **6**. A kampung that grows slowly loses its first quarters, so its stars come later. The Kecamatan scale is unchanged.
4. **From the RW on, the rival grows with the quarters spent in the stage** (`rivalYear` in `src/sim/ranking.ts`), from the quarter a typical player arrives in (`RIVAL_START`: RW 8, Kelurahan 17, Kecamatan 15). The first try kept the calendar clock, and the takeover check failed. A cheapskate game that reached the RW at 27 min met a rival that had grown all that time, and a builder taking it over earned nothing in 150 weeks (ratio 0.62 to 0.76, every seed). With the stage clock the same builder earns 2 to 3 stars in 150 weeks on every seed. The Kecamatan's 15 is the quarter its dev seed is promoted in.
5. **The rival stops growing after 16 quarters in a stage** (`RIVAL_GROWTH_QUARTERS`). Without it, a big kampung that stalled lost every quarter once the rival passed it, and each loss costs 5 Popularitas: the overgrowth test sat at Popularitas 15 forever. Every climbing type earns its last tier win within about 16 quarters, so their times do not change.

## Evidence
Nine player types, seeds 1 to 6, main against this branch: `BOT=<type> SEEDS=1,2,3,4,5,6 SCORECARD=1 npx vitest run tests/scorecard/run-one`. Median minutes at 1x (seeds that got there). Week lists are the distinct weeks of that star across bots and seeds.

| Bot | RW2 main | RW2 here | RW3 main | RW3 here | Kel1 main | Kel1 here | Kel2 main | Kel2 here | Kel3 main | Kel3 here |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| builder | 19.3 (6/6) | 20.8 (6/6) | 21.5 | 27.2 | 28.1 | 33.9 | 33.1 | 41.6 | 38.4 | 51.2 |
| shopkeeper | 19.2 | 20.8 | 21.4 | 27.2 | 28.1 | 33.9 | 33.1 | 40.0 | 38.4 | 49.6 |
| safety | 19.2 | 22.4 | 22.1 | 28.8 | 28.7 | 35.5 | 33.1 | 41.6 | 38.4 | 51.2 |
| pencitraan | 19.2 | 20.8 | 21.2 | 27.2 | 27.9 | 33.9 | 33.1 | 40.0 | 38.4 | 49.6 |
| honest | 21.7 | 21.7 | 23.5 | 27.2 | 30.2 | 33.9 | 33.1 | 41.6 | 38.4 | 51.2 |
| hint | 19.2 | 24.0 | 21.9 | 30.4 | 28.5 | 37.1 | 33.1 | 45.6 | 38.4 | 55.2 |
| random | 36.5 (5/6) | 36.5 (5/6) | 41.5 (3/6) | 41.5 (3/6) | 49.1 (3/6) | 49.1 (3/6) | 52.3 (3/6) | 54.4 (3/6) | 44.8 (1/6) | 60.8 (1/6) |
| cheapskate | 34.3 (6/6) | — (0/6) | 39.5 | — | 46.3 | — | 51.7 | — | 64.0 | — |
| idle | — | — | — | — | — | — | — | — | — | — |

The six climbing types reach Kel 3★ on 6 of 6 seeds on both. RT and RW 1★ times are unchanged for every type.

| | main | here |
| --- | --- | --- |
| RW length (min) | 6.7 to 11.6 | 12.8 to 16.0 |
| Kelurahan length (min) | 13.3 to 17.6 | 22.3 to 25.5 |
| Act 1 end, Kel 3★ (min) | 38.4 | 49.6 to 55.2 |
| Kel 2★ weeks | 248 (one pencitraan seed 200) | 288 to 348 |
| Kel 3★ weeks | 288 (one pencitraan seed 240) | 360 to 420 |
| Slowest over fastest type, Kel 3★ | 1.00 | 1.11 |

- **No star lands on the same week for every bot.** Kel 2★ and 3★ spread over 5 or 6 ranking weeks. RW 2★ lands on week 156 for builder, shopkeeper and Pencitraan, and later for safety, honest and hint.
- **Play matters again.** The hint reader, which builds less, is 3 to 4 min behind the builder at each Kelurahan star. On main the calendar evened that out. The spread stays inside GAME-DESIGN.md §8 item 18 (slowest over fastest at most 1.3, here 1.09 to 1.15 per star).
- **The cheapskate stops at RW 1★.** It sits at a ratio of about 1.0 and rarely wins. §8 item 18 asks only that it reaches RT 2★ in half the seeds (still 6 of 6) and that a builder can take over and progress. It can: 2 to 3 stars in 150 weeks from week 330, every seed. Neglect is allowed to cost the player (Hari, 2026-11-01).
- **The random placer** reaches each star on as many seeds as on main.
- **Kecamatan:** the Kecamatan bot (`KEC_BOT=1 SEEDS=3,4 npx vitest run tests/kec-bot.test.ts`) passes on both. Its Kelurahan run-in now takes 265 to 289 weeks (145 on main), and its Kecamatan stars land at the same weeks after promotion: 113, 250 and 425 (57 min), set by district progress.

## Scripted tests that changed
- `tests/rw-bot.test.ts` starts from the RT 3★ dev save (`src/sim/seeds/rt3.json`, 82 warga) instead of a new game forced to 3★ with about 10. With the stronger rival the tiny shortcut kampung never won a ranking (ratio under 0.92 for 30 quarters), which no played game looks like. Its 9-year and 12-year bounds hold.
- `tests/kel-bot.test.ts` keeps its shortcut start, which begins at week 0 and loses its first year of rankings. Kel 3★ on Auto-dana now comes at weeks 253 to 301 (window 240 to 330, was 120 to 180), and the Kecamatan bot's Kelurahan run-in gets 340 weeks (was 200).
- The overgrowth test now crowds the kampung at Kel 1★ and about 110 warga, so it overgrows to about 390, as it did on main. The old trigger (at 2★) now fired at about 370 warga, which made 640. The bot builds homes again once the overflow has moved out. All three seeds reach 3★ (weeks 217 to 229, Popularitas about 57).

## Against the targets
- **Act 1 ends at 50 to 55 min**, inside B4 and close to the "near 52 min" Hari set (GAME-DESIGN.md band table). It was 38.
- **Kelurahan:** 22 to 26 min, a star every 7 to 10 min (target about 30 and 10). Close, not on target.
- **RW:** 13 to 16 min (target about 20). Its 2★ and 3★ each come 6 to 9 min after the star before, inside the band table's RW star gap of 7 min. RW 1★ still comes within a minute of promotion, because Kampung Sebelah's three builds and the Stempel goal are quick. That is why the RW is short. Slowing it means a harder 1★, which is a separate call. Left as it is.
- **Goal gaps:** Kel 2★ and 3★ now each have a ranking line that moves every 12 weeks (1.6 min), so the goal list keeps moving. A line *finishing* can still be 7 to 10 min apart, as before. Scorecard rows 7 and 10 are the judge of that and stay on the open "remaining scorecard Fails" item.

## Not changed
- The RT. Its `rankWins` already counted every quarter, and its rival keeps the calendar.
- The Kecamatan's district pacing (90, 200 and 340 weeks of progress), which sets its 2★ and 3★. It is inside its 45 to 70 min band, and the tier wins there do not bind.
- Seen, not tuned: in the old overgrowth setup on this branch, a kampung of about 455 that had stopped building homes, with many of the test's 280 jobless warga still in it, settled at Popularitas about 26, under the 3★ bar of 35, while winning every ranking. Main never reached that size in the test. Whether a big, fully housed kampung can sink under the bar in real play is worth a probe under the open scorecard item.
- `scorecard/` numbers. `MAX_TICKS` in `tests/scorecard/plan.ts` rises from 450 to 600, because Kel 3★ now lands at up to week 456. The Nightly refreshes the scorecard.

## Verdict
Self-approved under the TODO rule. GAME-DESIGN.md §8 items 4 and 10: stars now follow play, not the calendar. Item 18 holds for the climbing types and the cheapskate's bar. The Kelurahan and the Act 1 total move to their targets, and the RW moves part of the way, for the reason above. TESTING.md: unit tests for the quarterly count, the late-arrival rival, the growth cap and the 3★ audit line; the nine player types compared against main; the Kecamatan bot rerun. GAME-DESIGN.md is updated in this PR (RW, Kelurahan and Kecamatan goal lines, the tier-win rule, the rival).
