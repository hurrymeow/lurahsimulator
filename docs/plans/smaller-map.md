# Smaller map

Status: draft. Not built until approved (`decisions/smaller-map-go.md`). Decisions 2, 4, 5 and 7 are the ones that need a yes.

## Goal
Build the ladder GAME-DESIGN.md section 2 already describes. The RW is your RT plus Kampung Sebelah. The Kelurahan is your RW (both RTs yours) plus RW 2 (two AI RTs). The Kelurahan drops from 16 RTs to 4. Source: TODO.md "Smaller map", `decisions/playtest-sk2.md`.

| Stage | Today | New | AI RTs |
| --- | --- | --- | --- |
| RT | 13x17, 1 RT | no change | 0 |
| RW | 28x36, 4 RTs | 28x17, 2 RTs side by side | 1 |
| Kelurahan | 58x74, 16 RTs | 28x36, 2x2 RTs | 2 |
| Kecamatan | 58x74 plus the district ring | 28x36 plus the district ring | 2 |

## Decisions

1. **The map stops being square.** `STAGE_SPAN` becomes a width and a height: RT 1x1, RW 2x1, Kelurahan and Kecamatan 2x2. `mapSpan()` returns both. The map still grows outward from tile (0,0), so no building moves at any promotion.
2. **Saves (needs a yes).** Bump `SAVE_VERSION` to 4. A v3 save at the RT stage loads as it is, because its map does not change. A v3 save at RW or above gets the start-new prompt, as with the Desa cut and the Kecamatan slice. Why: moving 3 or 15 AI RTs into 1 or 2 has no fair answer. Against: a player past the RT loses their run.
3. **Who owns what.** Your RW is the top row. RW 2 is the bottom row, so `rwOf` becomes `{ rx: 0, ry: cy }`.
   - The horizontal seam is Kelurahan lots: 28x2, 56 tiles, down from about 260.
   - The vertical seam in the top row is RW lots: 34 tiles, down from about 120. In the bottom row it is `other`.
   - RW and Kelurahan buildings can already go inside the player's RTs (`LOTS` in `src/sim/rules.ts`), so the smaller seams do not strand them.
4. **Absorbing Kampung Sebelah (needs a yes).** At promotion to Kelurahan it joins the player free: split the shared part of `takeover` into `absorb(s, n)`, with no Orang Dalam cost and any banked Dana refunded. If the player already took it over at the RW, nothing changes except the flag below. It sets `n.absorbed = true`, which means:
   - it cannot be handed back;
   - it leaves the Neighbours sheet, since it is now just your land;
   - it is not a Mutasi target.
5. **Rival scale, first pass (needs a yes).** `RIVAL_SCALE` was fitted to 1, 4 and 16 RTs, so left alone the rival becomes unbeatable. Today's RW value says each extra AI RT is worth about 0.53 of the player's score. That gives:
   - RW **1.5** (was 2.6);
   - Kelurahan **2.6** (was 8), the old value for 4 RTs;
   - Kecamatan **3.25** (was 10), which keeps today's 1.25x step above the Kelurahan.
   T4 tunes these with the bots.
6. **Goals read as names, not counts.** New goal kinds `sebelahAtStars { stars }` and `rw2AtStars { stars }` replace `rtsAtStars` and `rwsAtStars`. RW 2 is as good as its weaker RT, as `rwStars` does today. The goals are the ones in GAME-DESIGN.md section 3:
   - RW 1★: `fundedRts` n 1, plus Stempel.
   - RW 2★: Kampung Sebelah at 1★, 1 win, 2 RW combos.
   - RW 3★: Kampung Sebelah at 3★, 2 wins in a row, no debt for 24 weeks.
   - Kelurahan 1★, 2★, 3★: RW 2 at 1★, 2★, 3★, with the other goals unchanged.
7. **Kecamatan slice 1 (needs a yes).** Only the map under it and the rival scale change. The ring, the three modelled Kelurahan, pinjol, judol, razia and the stars stay. The 250-resident goal now has 2 RTs of land, so T4 checks it can be reached. The ring blocks are 14 tiles a side, sized against 58x74; T3 checks they still look right beside 28x36 and leaves the size alone unless they do not.
8. **Stempel stops at the Kelurahan.** RW 2 stamps its own, so `ownRw` sends nothing once Kampung Sebelah is absorbed. Clear the backlog at promotion so old letters never drain Popularitas.
9. **Grup Chat Warga moves to RW 2.** `sameTraitNeighbours` counts only AI-run RTs. In `promote`, the two new RTs are made to share a trait, so the combo can always happen. It does not fire at the RW, where there is one AI RT.
10. **Names.** `cellName` shows Kampung Sebelah for cell (1,0), then RT 3 and RT 4 for RW 2. Once Kampung Sebelah is yours it cannot poach staff, so `staff.poachedTitle` and `staff.refused` name the current stage's rival (`RIVAL_NAMES`).

## Risks the bots must answer

- **Stempel may stop mattering.** One AI RT sends about a third of the letters, against the same refill. If the RW bot's backlog never rises, the RW's verb is dead, and `STEMPEL.base` or `perBuild` needs to change.
- **Income changes shape.** AI iuran falls from 15 RTs to 2 at the Kelurahan, and so does Dana spending. Absorbing Kampung Sebelah adds its warga and its upkeep to the player's books. The scorecard's "cash piles up" row could move either way.
- **Serapan may get harder.** Anggaran is a flat yearly amount (`KEL.anggaranPerYear`), and there is less to spend it on. Not yet checked: whether Dana counts as spending. If it does, the 80% goal gets harder.
- **Pacing.** The targets stay RW about 20 min and Kelurahan about 30 min. A fast AI side leaves the own-kampung goals to carry the pace.

## Order with other work

- The Neighbours sheet (`docs/plans/neighbour-sheet.md`) T1 and T2 have merged, so nothing here waits on it.
- Hold these until T1 merges, because they build on the new map: "Build on AI-run RTs", "Show which RW and RT is yours" and "Make the path to RW 2★ clear".
- "Take over an RT in another RW" now only means RW 2. Reword that TODO item after T1.
- During T1, no other PR should change `src/sim/area.ts`, `src/sim/grow.ts` or the stage goals.

## Tasks

### T1. The new ladder (Opus, not for the executor)
One PR, because the map, goals, saves and bots break each other if split. It goes over the executor's 12-file limit.
- Files:
  - Sim: `src/sim/types.ts`, `area.ts`, `grow.ts`, `stages.ts`, `combos.ts`, `save.ts`, `state.ts`, `staff.ts`
  - Data: `src/data/higher/stages.ts`, `src/data/ranking.ts`
  - Strings: `src/i18n/en.ts`, `src/i18n/id.ts`
  - Seeds: `src/sim/seeds/*.json`, regenerated with `SEED_WRITE=1 npx vitest run tests/seed.test.ts`
  - Tests: `tests/grow.test.ts`, `rw.test.ts`, `higher.test.ts`, `kec.test.ts`, `rw-bot.test.ts`, `kel-bot.test.ts`, `kel-bot-lib.ts`, `kec-bot-lib.ts`, `seed-bot.ts`, `scorecard/driver.ts`, `e2e/ui.spec.ts`
  - Docs: `GAME-DESIGN.md`
- Changes: decisions 1 to 6 and 8 to 10. In GAME-DESIGN.md, correct the status line in section 2 (it still says 28x36 and 58x74) and add the absorbed rule to "Two ways to run a neighbour".
- Done when:
  - `npm run typecheck` and `npm test` pass;
  - tests cover the grid at each stage, `lotAt` on all three seam kinds, absorbing with and without an earlier takeover, no hand-back, and v3 saves (RT loads, RW refused);
  - the RW, Kelurahan and Kecamatan bots reach their stars, even if off the pacing bands, with any band miss listed for T4.
  - If a bot cannot reach a star at all, stop and report it rather than loosening the bot.

### T2. Sheets and notices (Sonnet, executor trial)
- Files: `src/ui/neighbours.ts`, `src/ui/staff.ts`, `src/i18n/en.ts`, `src/i18n/id.ts`, `tests/e2e/ui.spec.ts`
- Changes: the Neighbours sheet lists AI-run RTs only, with no hand-back on an absorbed RT. The staff screen's Mutasi list leaves absorbed RTs out and uses `cellName` instead of `RT ${i + 2}`. The promotion notice into the Kelurahan says Kampung Sebelah is now yours and RW 2 is new, in 20 words or fewer.
- Done when: the touched specs pass at 320px in ID and EN. No sim changes.

### T3. Camera and baselines (Sonnet)
- Files: `src/render/map.ts`, `src/render/scenery.ts`, `tests/e2e/ui.spec.ts`, the visual baselines
- Changes: remove `HALF_ZOOM_GRID_W`, since the Kelurahan now opens at full size. Check the opening view at the RW (28x17, wider than it is tall) at 320 and 412px, then the district ring beside 28x36. Refresh baselines through the "Update baselines" workflow and attach before and after to the PR.
- Done when: the frame-rate test passes, every stage opens with the player's RT in view, and screenshots at each stage are in the PR.

### T4. Balance (Opus)
- Files: `src/data/ranking.ts`, `src/sim/balance.ts`, `src/data/higher/rules.ts`, the bot tests' bands, `decisions/smaller-map-balance.md`
- Changes: answer each risk above with numbers from the bots, then tune the rival scale, Stempel, Anggaran and fund costs. Log each change and why. A pacing band moves only with Hari's yes.
- Done when: the RW and Kelurahan bots land within their bands on the agreed seeds, `tests/kec-bot.test.ts` passes, and a Nightly scorecard run has no new Fail against the last one on main.

### T5. Hari's playtest (Hari)
Play from RT 3★ to Kelurahan 3★, then log what changes in a new `decisions/` file.

## Done
New games follow the new ladder, the stage goals read as in GAME-DESIGN.md, and the bots reach each stage's stars.
