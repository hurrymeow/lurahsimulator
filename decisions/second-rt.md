# The 2nd RT: Kampung Sebelah is the player's from the RW

Plan: `docs/plans/second-rt.md`, tasks T1 to T3, approved by voidinside99 on 2026-11-04. Hari, 2026-11-02: "after expanding from RT 3 star, let players control and build on the 2nd town, and introduce the RT AI later". The tutorials (T5, T6) come in later PRs.

## What changed in the design
- At promotion to RW, Kampung Sebelah joins the player with its Kantor RT, Rumah and warga. It earns its own stars on the RT ladder. The first AI RTs are RW 2's, at the Kelurahan.
- RW 1★ now asks to build 3 in Kampung Sebelah, in place of funding it. The starter buildings do not count. The Stempel goal stays, and its weeks count only after the first letter.
- A build by the player in Kampung Sebelah sends letters at the RW. The home RT and seam lots send none, and letters stop at the Kelurahan.
- Dana, Auto-dana and Kunjungan first appear with RW 2.
- An old RW save hands Sebelah to the player on load, with no `SAVE_VERSION` bump.

## One change from the plan: 1 letter a build, not 2
The plan kept `STEMPEL.perBuild` at 2 and named 1 as the fallback. With 2, a bot that builds freely reached a backlog of 71 and Popularitas 0, and stayed there. The player can build far more often than an AI RT did (one build per 3 weeks), so 1 letter still pushes back once they build more than one a week. Jarang Muncul no longer doubles anything, since AI RTs send no letters to the player now.

## Rival: RW stays at 2.2
Decision 8 said to refit it from bot runs. The first RW ranking is won by 1.2x to 1.6x (hint 818 to 700, shopkeeper 1125 to 689, Pencitraan 947 to 649, 6 seeds each), and no bot lost a ranking. That is inside the 1.0x to 1.6x from `decisions/smaller-map-balance.md`, so the number does not change.

## Scorecard, same day, main against this branch (minutes at 1x, 10 seeds)
| Bot | RW time, main | RW time, here | Reaching RW 3★, main | Here |
| --- | --- | --- | --- | --- |
| hint | 5.6 | 9.6 | 10 of 10 | 10 of 10 |
| shopkeeper | 6.5 | 16.2 | 7 of 10 | 7 of 10 |
| Pencitraan | not reached by the median | 22.9 | 4 of 10 | 6 of 10 |

- The RW target is about 20 min (B3, 7 min a star). The RW moved closer with no new content, as decision 8 hoped. It is still short for the hint bot, so Hari's playtest should judge it.
- RT numbers are the same. The hint bot still reaches Kelurahan 3★ (38.4 min on both), and shopkeeper reaches it in 5 of 10 seeds inside the 60 min run against 7 of 10 on main. I did not check why those 2 seeds stop short; its RW takes longer, which may be the cause. No Kelurahan goal changed here. T4 measures that stage's load.
- Totals are 2 Pass, 14 Fail, 11 Unknown against 3, 13, 11 on main. The one verdict that moved is item 1, "Always a useful next move". It is not an RW stall: in seeds 8 and 9 the builder bot waits at the Kecamatan for a building of Rp 171jt to Rp 250jt. Why this differs from main was not traced. Worth a look in the Kecamatan balance work, and not changed here.

## Bots
The bots placed RT buildings nearest the home Kantor and never read goals, so with no Dana to spend they ignored Kampung Sebelah. They now do what the goal lines say:
- while a Kampung Sebelah goal is open, RT buildings go there;
- they stop building there while 5 or more letters wait;
- while an RW combo goal is open, they build combo pieces together, and move a piece that is at its limit, as a player would.

These bot changes affect only the RW numbers above. A person's reading of the same goal lines is what T7 and Hari's playtest check.

## Test setup
Tests of AI RT behaviour used the AI RT next door on the small map. They still do, through `withAi()` in `tests/grow.test.ts`, which hands Sebelah back to the AI: the rules do not depend on the cell, and this keeps them short. The real flow has its own tests in the same file under "the 2nd RT". The e2e specs for Dana, Kunjungan and AI paths moved to the Kelurahan, where those now are.

## Verdict
Self-approved under the TODO rule against GAME-DESIGN.md section 8, the UI.md review checklist and TESTING.md, for T1 to T3 only. The TODO item stays open until the tutorials ship.

## English event text
The regenerated seeds changed which event the density test meets first. It now meets the Ketertiban inspection, whose English body ran 21 words against the 20-word limit (UI.md rule 14), with a choice of 8 words against the 6-word label limit (rule 16). All four inspection bodies lost their extra words, since they share the pattern, and the choice now reads "Give the jukir a day off". The banjir and pothole bodies, also at 21, lost a word or two. The test reads only the first event it meets, so others can still be over: the hibah body is 23 words and was not changed.
