# The 2nd RT: T7, judged on screen

Plan: `docs/plans/second-rt.md`, task T7. Taken over from voidinside99 at the owner's request (the claim was 2 days old with no PR). The verdict is in its own file, not in `decisions/second-rt.md`, because CLAUDE.md says not to edit another PR's log file.

## How it was checked
The hint bot (it builds what the game names) played seed 2 and saved the game at RT 3★, RW 1★, RW 2★, RW 3★ and Kelurahan 1★. Each save was loaded into the built app at 320 px in Indonesian and English. Screenshots were taken of the map, the opened goal list and Neighbours, and each goal line was read as a new player would. This is the screenshot-only check from `decisions/rw2-clear.md` T3.

| Point | Goal shown | Does it say how? |
| --- | --- | --- |
| RW 1★ (to 2★) | win the yearly area ranking once; 1 RW combo | Yes: "win the yearly area score. Grow residents, combos and Popularitas" (Popularitas is the heart icon); "Next step: BetaMart opens soon" |
| RW 2★ (to 3★) | Kampung Sebelah to 3★; 2 RW combos | Yes: "build on its lots. Menu, Neighbours, Kampung Sebelah shows what it needs". Neighbours shows Kampung Sebelah as "Yours" with its stars and the one goal that blocks it |
| Kelurahan 1★ (to 2★) | 1 clean Tim Audit | Yes: "when Tim Audit comes, show the books. Keep every Wacana announced within a year" |

The tutorials for arrival, the first build and Dana (T5, T6) have their own e2e tests and were not screenshotted again.

## Found and fixed here
English used the plural with a count of 1 in five goal lines, among them the first RT goal every English player sees: "find 1 combos", "win the ranking 1 times", "win 1 area rankings", "find 1 RW combos" and "pass 1 Tim Audits clean". `t()` now uses a `<key>.one` line when `n` is 1, and these five have one. Indonesian does not change for plurals, so its `.one` lines are the same as the plain ones; the key test needs both tables to match.

## Seen, not changed
- Viral sits at 100 from RW 2★ on in these saves (from main). #319 fixes that.
- The welcome toast read "Pak RT" at every stage, because the injected saves had no player name set. A real game sets one in the setup, so this is not a bug.

## Verdict
Self-approved under the TODO rule. GAME-DESIGN.md §8: pace numbers are in `decisions/second-rt.md` and `decisions/second-rt-load.md` and were not rerun. UI.md checklist item 24 "Every goal says how": passes at each point above. TESTING.md: the singular has a unit test in `tests/i18n.test.ts`, and the goal e2e tests pass in `phone-412-en`.

Left for a person: Hari plays from RT 3★ to Kelurahan 1★ (this also covers the RW part of smaller-map T9).
