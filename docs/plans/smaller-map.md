# Smaller map

Status: approved by voidinside99 on 2026-11-02 ("start T1 with deepseek"), including decisions 2, 4, 5 and 7. Hari may still object in the PRs.

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
2. **Saves.** Bump `SAVE_VERSION` to 4. A v3 save at the RT stage loads as it is, because its map does not change. A v3 save at RW or above gets the start-new prompt, as with the Desa cut and the Kecamatan slice. Why: moving 3 or 15 AI RTs into 1 or 2 has no fair answer. Against: a player past the RT loses their run.
3. **Who owns what.** Your RW is the top row. RW 2 is the bottom row, so `rwOf` becomes `{ rx: 0, ry: cy }`.
   - The horizontal seam is Kelurahan lots: 28x2, 56 tiles, down from about 260.
   - The vertical seam in the top row is RW lots: 34 tiles, down from about 120. In the bottom row it is `other`.
   - RW and Kelurahan buildings can already go inside the player's RTs (`LOTS` in `src/sim/rules.ts`), so the smaller seams do not strand them.
4. **Absorbing Kampung Sebelah.** At promotion to Kelurahan it joins the player free: split the shared part of `takeover` into `absorb(s, n)`, with no Orang Dalam cost and any banked Dana refunded. If the player already took it over at the RW, nothing changes except the flag below. It sets `n.absorbed = true`, which means:
   - it cannot be handed back;
   - it leaves the Neighbours sheet, since it is now just your land;
   - it is not a Mutasi target.
5. **Rival scale, first pass.** `RIVAL_SCALE` was fitted to 1, 4 and 16 RTs, so left alone the rival becomes unbeatable. Today's RW value says each extra AI RT is worth about 0.53 of the player's score. That gives:
   - RW **1.5** (was 2.6);
   - Kelurahan **2.6** (was 8), the old value for 4 RTs;
   - Kecamatan **3.25** (was 10), which keeps today's 1.25x step above the Kelurahan.
   T8 tunes these with the bots.
6. **Goals read as names, not counts.** New goal kinds `sebelahAtStars` and `rw2AtStars` replace `rtsAtStars` and `rwsAtStars`, which go unused after T5. RW 2 is as good as its weaker RT, as `rwStars` does today. The goals are the ones in GAME-DESIGN.md section 3:
   - RW 1★: `fundedRts` n 1, plus Stempel.
   - RW 2★: Kampung Sebelah at 1★, 1 win, 2 RW combos.
   - RW 3★: Kampung Sebelah at 3★, 2 wins in a row, no debt for 24 weeks.
   - Kelurahan 1★, 2★, 3★: RW 2 at 1★, 2★, 3★, with the other goals unchanged.
7. **Kecamatan slice 1.** Only the map under it and the rival scale change. The ring, the three modelled Kelurahan, pinjol, judol, razia and the stars stay. The 250-resident goal now has 2 RTs of land, so T8 checks it can be reached. The ring blocks are 14 tiles a side, sized against 58x74; T7 checks they still look right beside 28x36 and leaves the size alone unless they do not.
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
- Hold these until T5 merges, because they build on the new map: "Build on AI-run RTs", "Show which RW and RT is yours" and "Make the path to RW 2★ clear".
- "Take over an RT in another RW" now only means RW 2. Reword that TODO item after T5.
- From T1 until T5 merges, no other PR should change `src/sim/area.ts`, `src/sim/grow.ts` or the stage goals.

## Tasks

T1 to T5 replace the single PR first drafted here. voidinside99 asked for the DeepSeek executor (2026-11-02), and its gate caps a task at 12 files and 400 lines, counting the two notes, and it cannot run the seed writer. T1 to T4 change no behaviour for a new game, so each passes CI alone. T5 flips the map. Run them in order, one at a time; a later task assumes the earlier ones are on main. Claude reviews every diff before merge.

### T1. Non-square grid, same map (Sonnet, executor trial)
- Files: `src/sim/types.ts`, `src/sim/area.ts`, `src/sim/grow.ts`, `src/sim/save.ts`, `tests/grow.test.ts`
- Exact changes: no behaviour change, the map stays square.
  - `src/sim/types.ts`: `STAGE_SPAN` becomes `Record<StageId, { w: number; h: number }>` with `rt: { w: 1, h: 1 }`, `rw: { w: 2, h: 2 }`, `kelurahan: { w: 4, h: 4 }`, `kecamatan: { w: 4, h: 4 }`. `setGrid` uses `w` for `GRID_W` and `h` for `GRID_H`. `mapSpan()` returns `{ w: (GRID_W + SEAM) / CELL_W, h: (GRID_H + SEAM) / CELL_H }`.
  - `src/sim/area.ts`: in `lotAt`, `const span = mapSpan().w;` and the rest stays as it is. In `neighbourCells`, loop `cy` up to `mapSpan().h` and `cx` up to `mapSpan().w`.
  - `src/sim/grow.ts`: `cellName` uses `mapSpan().w`.
  - `src/sim/save.ts`: in `ungap`, read `const { w, h } = STAGE_SPAN[s.stage.current];`, run the moves when `w > 1`, and call `ungapTile(b.x, RT_W, w)` and `ungapTile(b.y, RT_H, h)`.
  - `tests/grow.test.ts`: add one test that `mapSpan()` is `{ w: 1, h: 1 }` on a new game and `{ w: 2, h: 2 }` after one `promote`.
- Done when: `npm run typecheck` and `npm test` pass with no existing test edited; `decisions/smaller-map-T1.md` and `progress/smaller-map-T1.md` exist.
- Don't touch: the span values beyond the above, `lotAt`'s rules, `rwOf`, goals, strings, `src/render/`, TODO.md. No e2e needed.

### T2. Absorbing an RT, not yet used (Sonnet, executor trial)
- Files: `src/sim/types.ts`, `src/sim/grow.ts`, `src/sim/combos.ts`, `src/sim/staff.ts`, `tests/grow.test.ts`
- Exact changes:
  - `src/sim/types.ts`: add `absorbed?: boolean` to `Neighbour`, with a one-line comment: joined the player at promotion, cannot be handed back.
  - `src/sim/grow.ts`: move everything in `takeover` after the Orang Dalam charge into a private `joinPlayer(s, n)`, and have `takeover` call it. Export `absorb(s, n)`: if `n.run !== 'player'` call `joinPlayer`, then set `n.absorbed = true`. `handBack` returns at once when `n.absorbed`.
  - `src/sim/combos.ts`: `sameTraitNeighbours` counts only RTs where `run !== 'player'`.
  - `src/sim/staff.ts`: `mutasiTargets` leaves out absorbed RTs, keeping each RT's index in `s.neighbours`. `checkMutasi` tests `mutasiTargets(s).length` instead of `s.neighbours.length`.
  - `tests/grow.test.ts`: add tests that `absorb` costs no Orang Dalam, refunds banked Dana, moves buildings and warga to the player, keeps the RT's stars, works on an RT already taken over, and that `handBack` then does nothing.
- Done when: `npm run typecheck` and `npm test` pass with no existing test edited; the two notes exist as `decisions/smaller-map-T2.md` and `progress/smaller-map-T2.md`.
- Don't touch: `promote`, `checkTakeover`, `src/ui/`, TODO.md. Nothing calls `absorb` yet. No e2e needed.

### T3. Goals that name Kampung Sebelah and RW 2, not yet used (Sonnet, executor trial)
- Files: `src/sim/types.ts`, `src/sim/stages.ts`, `src/i18n/en.ts`, `src/i18n/id.ts`, `tests/grow.test.ts`, `tests/higher.test.ts`
- Exact changes:
  - `src/sim/types.ts`: add goal kinds `{ kind: 'sebelahAtStars'; n: number }` and `{ kind: 'rw2AtStars'; n: number }`, where `n` is the stars asked for. Keep `rtsAtStars` and `rwsAtStars` for now.
  - `src/sim/stages.ts`: `sebelahAtStars` has the stars of the neighbour at cell (1,0), or 0. `rw2AtStars` has the lowest stars among neighbours with `cy === 1`, or 0 if there are none. Add both to the map of goal text keys.
  - `src/i18n/en.ts`, keep keys A to Z:
    - `'stage.goal.sebelahAtStars'`: `'Kampung Sebelah at {n}★ or above (now {have}★)'`
    - `'stage.goal.rw2AtStars'`: `'RW 2 at {n}★ or above (now {have}★)'`
    - `'stage.goalShort.sebelahAtStars'`: `'get Kampung Sebelah to {n}★'`
    - `'stage.goalShort.rw2AtStars'`: `'get RW 2 to {n}★'`
    - `'stage.goal.fundedRts'` becomes `'Fund Kampung Sebelah once (have {have})'`
    - `'stage.goalShort.fundedRts'` becomes `'fund Kampung Sebelah once'`
  - `src/i18n/id.ts`, the same keys:
    - `'stage.goal.sebelahAtStars'`: `'Kampung Sebelah berbintang {n}★ atau lebih (kini {have}★)'`
    - `'stage.goal.rw2AtStars'`: `'RW 2 berbintang {n}★ atau lebih (kini {have}★)'`
    - `'stage.goalShort.sebelahAtStars'`: `'bawa Kampung Sebelah ke {n}★'`
    - `'stage.goalShort.rw2AtStars'`: `'bawa RW 2 ke {n}★'`
    - `'stage.goal.fundedRts'` becomes `'Danai Kampung Sebelah satu kali (punya {have})'`
    - `'stage.goalShort.fundedRts'` becomes `'danai Kampung Sebelah satu kali'`
  - `tests/grow.test.ts`: add tests for both kinds, with `goalProgress` on a state with the neighbours set by hand. In `tests/grow.test.ts` or `tests/higher.test.ts`, if an existing test expects the old `fundedRts` text, update that text only.
- Done when: `npm run typecheck` and `npm test` pass; the two notes exist as `decisions/smaller-map-T3.md` and `progress/smaller-map-T3.md`.
- Don't touch: `src/data/higher/stages.ts`, other strings, `src/ui/`, TODO.md. No e2e needed. If typecheck asks for a change in a file not listed, set status `stopped` and name it.

### T4. Save version 4 (Haiku)
- Files: `src/sim/state.ts`, `src/sim/save.ts`, `src/sim/seeds/rt3.json`, `src/sim/seeds/rw.json`, `src/sim/seeds/kel.json`, `tests/grow.test.ts`
- Exact changes:
  - `src/sim/state.ts`: `SAVE_VERSION = 4`.
  - `src/sim/save.ts`: in `deserialize`, replace the version check. Refuse anything that is not version 3 or 4. Refuse version 3 unless `s.stage?.current === 'rt'`, with this comment: `// The map shrank (docs/plans/smaller-map.md). A v3 save past the RT cannot carry its AI RTs over, so the player is asked to start anew.` Set `s.version = SAVE_VERSION` on a v3 save that loads.
  - Each seed file: change only its opening `{"version":3,` to `{"version":4,`.
  - `tests/grow.test.ts`: add tests that a v3 RT save loads as version 4 and a v3 RW save returns null.
- Done when: `npm run typecheck` and `npm test` pass; the two notes exist as `decisions/smaller-map-T4.md` and `progress/smaller-map-T4.md`.
- Don't touch: other save migrations, anything else in the seeds, TODO.md. No e2e needed. If another test pins the version, set status `stopped` and name it.

### T5. The flip to the new ladder (Sonnet, executor trial)
- Files: `src/sim/types.ts`, `src/sim/area.ts`, `src/sim/grow.ts`, `src/data/higher/stages.ts`, `src/data/ranking.ts`, `tests/grow.test.ts`, `tests/rw.test.ts`, `tests/higher.test.ts`, `tests/rw-bot.test.ts`, `tests/kel-bot-lib.ts`
- Exact changes:
  - `src/sim/types.ts`: `STAGE_SPAN` is `rw: { w: 2, h: 1 }`, `kelurahan: { w: 2, h: 2 }`, `kecamatan: { w: 2, h: 2 }`. Correct the comments that say 2x2 RWs, 16 RTs or half zoom.
  - `src/sim/area.ts`: `rwOf` returns `{ rx: 0, ry: cy }`. In `lotAt`, a tile on a horizontal seam (`sy >= 0`) is `'kel'`; a tile on a vertical seam is `'rw'` when `y < RT_H` and `'other'` otherwise. Tiles inside a cell keep today's rule.
  - `src/sim/grow.ts`, in `promote`:
    - after the new RTs are added, when `next === 'kelurahan'`, call `absorb` on the neighbour at cell (1,0) and set `s.stempel.backlog = 0`;
    - the Grup Chat Warga trait rule looks only at RTs with `run !== 'player'`: when there are two or more and all their traits differ, the last takes the first's trait.
    - `cellName` returns `'Kampung Sebelah'` for cell (1,0), and otherwise keeps `RT {n}`.
  - `src/data/higher/stages.ts`, goals only:
    - RW 1★: `fundedRts` `n: 1`.
    - RW 2★: replace `rtsAtStars` with `{ kind: 'sebelahAtStars', n: 1 }`.
    - RW 3★: replace both `rtsAtStars` lines with `{ kind: 'sebelahAtStars', n: 3 }`.
    - Kelurahan 1★, 2★, 3★: replace `rwsAtStars` with `{ kind: 'rw2AtStars', n: 1 }`, `n: 2` and `n: 3`.
  - `src/data/ranking.ts`: `RIVAL_SCALE` is `{ rt: 1, rw: 1.5, kelurahan: 2.6, kecamatan: 3.25 }`, and its comment says 1, 2 and 4 RTs.
  - Tests: update the named tests' expected grid sizes, neighbour counts, lot positions and goal kinds to the new map, and nothing else. Move the Grup Chat Warga tests in `tests/rw.test.ts` to a Kelurahan state, since one AI RT at the RW cannot form the pair. `tests/kel-bot-lib.ts` and `tests/rw-bot.test.ts` change only if a lot lookup needs it.
- Known failures: `tests/seed.test.ts`, because the seeds still hold the old map. Claude regenerates them on this branch. Ignore them.
- Done when: `npm run typecheck` and `npm test` pass apart from `tests/seed.test.ts`; `decisions/smaller-map-T5.md` lists the tests changed; `progress/smaller-map-T5.md` exists.
- Don't touch: `src/sim/save.ts`, `src/render/`, `src/ui/`, seeds, balance numbers other than `RIVAL_SCALE`, TODO.md. No e2e run needed. If any test outside Files fails, or a bot misses a star or a timing band, do not loosen it: set status `stopped` with the test names and numbers, and leave your diff in place. Claude finishes from there.

After review, Claude adds to the T5 branch what the gate cannot: regenerated seeds, the GAME-DESIGN.md status line and absorbed rule, and any fixes in `tests/kec*.ts`, `tests/seed-bot.ts`, `tests/scorecard/driver.ts` and `tests/e2e/ui.spec.ts`.

### T6. Sheets and notices (Sonnet, executor trial)
- Files: `src/ui/neighbours.ts`, `src/ui/staff.ts`, `src/sim/staff.ts`, `src/i18n/en.ts`, `src/i18n/id.ts`, `tests/e2e/ui.spec.ts`
- Exact changes: the Neighbours sheet lists only RTs that are not absorbed, with no hand-back on an absorbed RT. The staff screen's Mutasi list uses `mutasiTargets` and `cellName` instead of `RT ${i + 2}`. The promotion notice into the Kelurahan says Kampung Sebelah is now yours and RW 2 is new, in 20 words or fewer. `staff.poachedTitle` and `staff.refused` take the current stage's rival from `RIVAL_NAMES`.
- Done when: the touched specs pass at 320px in ID and EN; the two notes exist as `decisions/smaller-map-T6.md` and `progress/smaller-map-T6.md`.
- Don't touch: `src/sim/grow.ts`, TODO.md.

### T7. Camera and baselines (Sonnet)
- Files: `src/render/map.ts`, `src/render/scenery.ts`, `tests/e2e/ui.spec.ts`, the visual baselines
- Changes: remove `HALF_ZOOM_GRID_W`, since the Kelurahan now opens at full size. Check the opening view at the RW (28x17, wider than it is tall) at 320 and 412px, then the district ring beside 28x36. Refresh baselines through the "Update baselines" workflow and attach before and after to the PR. Not for the executor: it needs judging by eye, and the gate refuses baselines.
- Done when: the frame-rate test passes, every stage opens with the player's RT in view, and screenshots at each stage are in the PR.

### T8. Balance (Opus)
- Files: `src/data/ranking.ts`, `src/sim/balance.ts`, `src/data/higher/rules.ts`, the bot tests' bands, `decisions/smaller-map-balance.md`
- Changes: answer each risk above with numbers from the bots, then tune the rival scale, Stempel, Anggaran and fund costs. Log each change and why. A pacing band moves only with Hari's yes.
- Done when: the RW and Kelurahan bots land within their bands on the agreed seeds, `tests/kec-bot.test.ts` passes, and a Nightly scorecard run has no new Fail against the last one on main.

### T9. Hari's playtest (Hari)
Play from RT 3★ to Kelurahan 3★, then log what changes in a new `decisions/` file.

## Done
New games follow the new ladder, the stage goals read as in GAME-DESIGN.md, and the bots reach each stage's stars.
