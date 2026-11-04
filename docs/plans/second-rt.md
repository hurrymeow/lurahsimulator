# The 2nd RT, then the AI RT

Status: approved by voidinside99 on 2026-11-04 ("Approve, start T1"), with every decision as recommended. Decisions 1, 3 and 4 change GAME-DESIGN.md section 2, so Hari may still object in the PRs.

## Goal
TODO item "Let the player control and build on the 2nd RT after the RT reaches 3★, and add the AI-run RT later, each with a tutorial." Hari, 2026-11-02: "after expanding from RT 3 star, let players control and build on the 2nd town, and introduce the RT AI later".

Done when: after the 3★ expansion, a new player builds in the 2nd RT with a tutorial for each step, EN and ID at 320 px, and the AI-run RT step follows with its own tutorial.

| Stage | Today | New |
| --- | --- | --- |
| RW | Your RT, plus Kampung Sebelah run by the AI | Your RT, plus Kampung Sebelah run by you |
| RW verbs | Dana, Kunjungan, Stempel | Build in a 2nd RT, Stempel |
| Kelurahan | Sebelah is absorbed, RW 2 (two AI RTs) appears | RW 2 (two AI RTs) appears: your first AI RTs |
| Kelurahan verbs | Anggaran | Anggaran, Dana, Kunjungan |

## What the code already gives us
- A player-run RT earns its own stars. `neighboursSystem` runs its star loop for every neighbour, and `viewOf` reads a player-run cell through `playerCellView`. So `sebelahAtStars` keeps working.
- A Kantor RT that moves to the player is a road hub (`connectedRoad`). Sebelah's roads work without a road across the seam.
- `joinPlayer` already moves buildings and warga to the player. `aiLotAt` already treats a player-run cell as the player's own.

## Decisions (each with a recommendation)

1. **Where the AI step goes.** The RW map has no room for a third RT, so the first AI RTs become RW 2 at the Kelurahan. Recommended.
   - Alternative: RW 2 opens at RW 2★, so AI RTs arrive sooner. The map would then grow in the middle of a stage, which nothing does today. Not recommended.
   - Alternative: widen the RW to three RTs. This undoes the smaller map. Not recommended.
2. **What the 2nd RT starts with.** It keeps today's starter: a Kantor RT and one Rumah, handed over at promotion. The player arrives at a working hub with one thing to build beside. Recommended over empty lots, which would need a free or paid Kantor RT and a new rule.
3. **RW 1★ goals.** `fundedRts` has nothing to fund, so it becomes a new goal kind, `sebelahBuilds`: "Build 3 in Kampung Sebelah". The starter buildings do not count. `stempelClear` stays. RW 2★ and 3★ keep their goals, since `sebelahAtStars` now means the player climbs the ladder they just learned.
4. **Stempel.** Today its letters come only from AI builds, so it would have no sender at the RW. Recommended: at the RW, each build the player makes in Kampung Sebelah sends letters (`STEMPEL.perBuild`, 2). Balai RW, Calo and `stempelClear` keep their meaning, and the RW keeps a new rule of its own. Letters stop at the Kelurahan, as the doc says today.
   - The RW 1★ goal needs care: `stempel.clear` also counts weeks with no letters at all, so the goal can finish before the player has met the rule. T2 makes it count only after the first letter.
   - Alternative: move Stempel to the Kelurahan and let RW 2's letters reach the player. This reverses a smaller-map decision and adds another system to that stage. Not recommended.
   - Alternative: retire Stempel. This removes Balai RW's main job and Calo. Too large for this item.
5. **Dana and Kunjungan move to the Kelurahan.** They need an AI RT, so they first appear with RW 2. The Kelurahan then teaches Anggaran, Dana and Kunjungan together, which is the main risk of this plan. T4 measures it against the B4 novelty and goal limits. If it fails, Anggaran's first step waits until RW 2 has been funded once.
6. **Absorbing.** `absorb` moves to the promotion to RW, and the Kelurahan promotion no longer calls it. Sebelah stays out of Mutasi targets and cannot be handed back, as today. `takeover` and `handBack` are not touched here.
7. **Neighbours sheet at the RW.** There is no AI RT to tend, but the player still needs Sebelah's checklist. The sheet stays, with one row for Sebelah: its stars, the one blocking goal, and Go to RT. No Dana or Kunjungan buttons. The nameplate becomes "Kampung Sebelah · Yours" (ID "Milikmu"), following `decisions/map-owners.md`.
8. **Rival and pace.** `RIVAL_SCALE.rw` (2.2) was fitted with the AI RT in place, and the player's score now differs. T3 refits it from bot runs instead of guessing a number now. The RW's star gap target stays 7 min (B3). T3 logs whether building a second RT brings the RW closer to it. No new content is added to reach it.
9. **Saves.** No `SAVE_VERSION` bump. On load, an RW save with an AI-run Sebelah calls the same absorb, so a player in the middle of the RW keeps their game. Stars already earned stay. A Kelurahan or Kecamatan save does not change.
10. **Tutorial form.** No new system.
    - `src/ui/coach.ts` handles steps that point at something, as it does for the first build. It already chooses its step from what is on screen.
    - `src/ui/howto.ts` holds the steps that explain, as tips with a `when(s)`.
    - Coach steps follow the player's action, so they do not wait for the 60 s `GAP_MS`. Tips still wait for it.
11. **T9 of the smaller map.** Hari has not yet playtested the smaller map, and T1 changes its RW. Recommended: Hari plays the RW after T1 is merged, not before. The RT and Kelurahan parts of T9 can still be played today.

## Tasks

### T1: Kampung Sebelah is yours from the RW (one PR with T2 and T3)
Files: `src/sim/grow.ts`, `src/sim/save.ts`, `src/ui/neighbours.ts`, the nameplate code from `decisions/map-owners.md`, `src/i18n/en.ts`, `src/i18n/id.ts`, GAME-DESIGN.md section 2, `decisions/second-rt.md`, `progress/second-rt-T1.md`.
- `promote` to RW creates Sebelah with its starter, then absorbs it. The Kelurahan step no longer absorbs.
- Move "Kampung Sebelah is yours now" from `grow.promotedKelBody` to the RW promotion notice.
- Load-time absorb for old RW saves (decision 9).
- The sheet row and nameplate (decision 7). Hide Dana and Auto-dana until an AI RT exists.
- Update the GAME-DESIGN.md diagram, RW and Kelurahan sections, and AI neighbours rules in this PR.

Done when: a promoted player places an RT building in Sebelah with no road across the seam, Sebelah's stars rise from it, and an old RW save loads with Sebelah player-run.

Don't touch: `takeover`, `handBack`, Kunjungan rules, RW 2's AI behaviour.

### T2: RW goals and letters
Files: `src/data/higher/stages.ts`, `src/sim/stages.ts`, `src/sim/types.ts`, `src/sim/rules.ts`, `src/sim/grow.ts`, `src/sim/nextstep.ts`, `src/ui/goal.ts`, i18n, `tests/goal-how.test.ts`, `tests/grow.test.ts`, `tests/higher.test.ts`, `tests/nextstep.test.ts`.
- Add goal kind `sebelahBuilds` with `GOAL_HOW`, goal and short-goal lines. Remove `fundedRts` if nothing else uses it.
- Player builds in Sebelah send letters at the RW stage. A building on an RW seam lot sends none.
- `stempel.clear` starts counting after the first letter.
- `goal.how.sebelahAtStars` loses Dana and Kunjungan, since they cannot reach a player-run RT.

Done when: every RW goal line names an action the player can take at that moment, and `tests/goal-how.test.ts` passes.

### T3: Bots, seeds and rival
Files: `tests/seed-bot.ts`, `tests/kel-bot-lib.ts`, `tests/rw.test.ts`, `tests/rw-bot.test.ts`, `tests/properties.test.ts`, `tests/owners.test.ts`, `tests/scorecard/scorecard.ts`, `src/sim/seeds/`, `src/data/ranking.ts`.
- Teach the bots to build in Sebelah at the RW, and to fund RW 2 at the Kelurahan.
- Regenerate seeds. Refit `RIVAL_SCALE.rw`, then check the Kelurahan and Kecamatan against `decisions/smaller-map-balance.md`.
- Refresh visual baselines through the "Update baselines" workflow.

Done when: the RW bot reaches 3★ in every seed with its time logged against B3, the Kelurahan bot still reaches 3★, and `npm run scorecard` is no worse than on main, with any change explained.

### T4: Kelurahan load check
Files: `decisions/second-rt-load.md`, and `src/sim/stages.ts` or `src/sim/nextstep.ts` only if the check fails.
- Measure Kelurahan 0★ to 1★ against the B4 limits. Apply the fallback in decision 5 if it fails.

Done when: the numbers are logged and the stage passes B4 in the scorecard.

### T5: Tutorial for the 2nd RT
Files: `src/ui/coach.ts`, `src/ui/howto.ts`, i18n, a new `tests/e2e/second-rt.spec.ts`.

| Step | When | Form | Says (EN draft) |
| --- | --- | --- | --- |
| Arrive | Just promoted to RW | Map pans to Sebelah, coach | "Kampung Sebelah is yours. Build here too." |
| First build | Right after Arrive | Coach on `#dock-build` | "Build beside its Kantor RT." |
| Letters | First letter queued | Tip | "Builds here need a stamp. Stempel clears the letters." |
| Stars | First build done | Tip | "Sebelah earns its own stars. See Neighbours." |

The wording is a draft. The Indonesian text goes through the tone rules in CONTRIBUTING.md.

Done when: the spec walks all four steps at 320 px in `phone-320-id` and `phone-320-en` with no clipping, and each coach step clears by doing the action.

Don't touch: the RT-stage coach steps and their `pakrt.coach` progress.

### T6: Tutorial for the AI RT
Files: same as T5.

| Step | When | Form | Says (EN draft) |
| --- | --- | --- | --- |
| Meet RW 2 | Just promoted to Kelurahan | Map pans to RW 2, coach | "RW 2 runs itself. These RTs are not yours." |
| Dana | First look at the sheet | Coach on the Dana button | "Dana makes the AI build." |
| Kunjungan or build | First Dana spent | Tip | "Visit once a quarter, or build on their lots." |

Done when: the same two 320 px projects walk all three steps, and the player funds RW 2 for the first time during them.

### T7: Judge and hand to Hari
- Run the screenshot-only check from `decisions/rw2-clear.md` on RW 1★ to 3★ and on Kelurahan 0★ to 1★.
- Judge against GAME-DESIGN.md section 8, the UI.md review checklist and TESTING.md, with the verdict in `decisions/second-rt.md`.
- Ask Hari to play from RT 3★ through Kelurahan 1★. This also covers the RW part of smaller-map T9.

## Order and size
T1, T2 and T3 ship as one PR, because each alone leaves the RW with a goal nobody can finish. T4, T5 and T6 are one PR each. T7 is a docs-only note.

## Risks
- **Kelurahan load** (decision 5). It gets the verbs the RW gives up.
- **Letters as a tax.** Two letters a build against one Stempel a week could feel like a brake on the very action this item encourages. The drain is mild (0.5 Sabar per unstamped letter), but T3 should watch it, and `perBuild` can drop to 1 for this source.
- **The rival becomes yours.** The intro and `how.10.body` name Kampung Sebelah as the rival, and the player then gets it at the RW. That can read well ("you beat them, now you run them"), but the RW notice has to say so, and the RW's ranking text must name a rival that still exists.
