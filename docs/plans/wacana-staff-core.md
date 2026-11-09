# Make Wacana and Staf matter

## Goal
Staff and Wacana sit outside the core loop. You can reach every star without hiring anyone or announcing a single wacana (playtest feedback from joofoot and kokoliem, 2026-11-09). Make both into levers that a good player pulls, without soft-locking a player who ignores them. Hari picked "D + soft B, then C" on 2026-11-09, and asked for tasks the DeepSeek executor can run.

## Evidence on main (ed92325)
- No star goal reads staff, Wacana or the Laporan. Act 1 goals are residents, combos, Popularitas (`sabar`), rankings and stage items (`src/data/stages.ts`, `src/data/higher/stages.ts`).
- The scorecard bots never hire (`tests/scorecard/driver.ts` has no staff calls) and still reach every star.
- `laporan()` (`src/sim/needs.ts`) is only shown in `src/app.ts`. Nothing reads it, though the header of `src/data/realisasi.ts` says "Promotion reads the Laporan".
- One wacana buys about 5 Popularitas in total for Rp 100k (`WACANA_POWER` 10 × `WACANA_SABAR_PER_POWER` 0.1, decaying ×0.8 a week). A Pos Ronda does that better.
- The ranking score (`score()` in `src/sim/ranking.ts`, `SCORE` in `src/data/ranking.ts`) counts residents, buildings, combos, Popularitas and Emas. It ignores programs.
- The desk queue is the only real staff lever. With the Kantor floor (0.5 folders a week) and short permits, Inem alone is good enough.
- Kokoliem's refusal fix merged as #380. No open PR touches staff or Wacana.

## Decisions and why
1. **Programs count in the quarterly ranking (option D).** rankWins and tierWins are already star goals, so programs become a real lever. The satire bites: announcing wins rankings, and only doing moves Sejahtera. Wacana counts by its current power, so fatigue and decay limit spam, and announcing just before a ranking pays best.
2. **Every program has a PIC from your staff (option D).** Gaul sets how much a wacana lands. Rajin sets how fast a Realisasi lands, and Jujur how much of it leaks. A Realisasi lead works at half output until the program lands. This ties Wacana and Staf into one loop, the way Kairosoft assigns staff to projects.
3. **The PIC is picked for you.** The best free person for the stat is preselected, and Inem can always lead. So no program is ever blocked, and announcing stays one tap.
4. **The desk queue grows with the stage (soft B).** Permits need more folders from the RW, so Inem alone falls behind. The Kantor floor stays, so nothing locks. It only slows.
5. **Bots learn to hire first (T1).** The later tuning step compares bots, so the bots must use the new levers.
6. **The secondary goals board (option C) waits.** Plan it after a playtest of T1 to T6. It is in TODO.md Later.
7. **Doc change.** Each task updates its own GAME-DESIGN.md lines in the same PR, as given below, per the AGENTS.md conformance protocol. "Requests never gate stars" stays true.

## How to run it
- T1 to T5 are tagged `(Sonnet, executor trial)`. Dispatch `deepseek-exec.yml` with slug `wacana-staff-core`, one task per run, in order T1, T2, T3, T4, T5. T2 and T5 depend only on T1. T4 needs T3 merged.
- The dispatching thread subscribes to each executor PR, reads the full diff and pushes a review commit so `ci` runs (`decisions/executor-stalled-pr.md`).
- T6 is a Claude Sonnet thread after the next Nightly scorecard. The executor can't run the scorecard.

## Tasks

### T1. Bots hire an Asisten and answer raises (Sonnet, executor trial)
- Files: `tests/scorecard/driver.ts`, `tests/scorecard/harness.test.ts`
- Exact changes:
  - In `tests/scorecard/driver.ts`, add `hire: boolean` and `realisasi: boolean` to `interface Plan`. In `BASE` set `hire: true, realisasi: false`. In `PLANS`, set `cheapskate` to `hire: false`. Set `honest` to `realisasi: true`. The `idle` and `random` bots never call the new code.
  - Add a function `staffWhen(c: Ctx, p: Plan)`, called in `playPlan` just before `announceWhen`. When `p.hire` is true it does three things, in this order:
    1. For every staff member with `raiseAsked`, call `answerRaise(s, x, true)` (from `src/sim/staff.ts`).
    2. If `s.lowongan` has applicants, call `hire(s, id)` with the applicant whose `stats.lobi` is highest (lowest `id` on a tie). Count `c.acts++` on success.
    3. Else if `!s.lowongan` and `c.t % 4 === 0` and fewer than 2 staff have role `asisten` and `s.res.rupiah >= lowonganCost(s, 'grupWa') + p.buffer + 12 * (current weekly wage bill of all staff + the new Asisten's weekly wage)` (find the wage helpers in `src/sim/staff.ts`; use the Asisten's base wage for the new hire), call `postLowongan(s, 'asisten', 'grupWa')` (it checks role and slot itself). Count `c.acts++` on success. Do not read `nextStep`: the builder never sees the desk hint (queue peaks near 6 weeks against `hireAfter` 12), so a hint trigger never fires. Hari's coordinator chose this on 2026-11-09 (`decisions/wacana-staff-core.md`).
  - Add a function `realisasiWhen(c: Ctx, p: Plan)`, called right after `staffWhen`. When `p.realisasi` is true and `c.t % 4 === 0`, start the first Realisasi in `REALISASI` (from `src/data/realisasi.ts`) for which `checkRealisasi(s, d.id).ok` holds and `s.res.rupiah >= realisasiCost(s, d) + p.buffer`. Then call `startRealisasi(s, d.id)` and count `c.acts++`.
  - In `tests/scorecard/harness.test.ts`, add one test, `a builder hires an Asisten once it can afford one`. Get the final state the way `tests/scorecard/run-takeover.test.ts` or `RunOpts` does (read `runBot` for the option that receives the final state). Run `builder` on seed 3 for 400 ticks. Expect the final state to hold at least 2 staff with role `asisten`, Inem included. If 400 ticks is not enough on seed 3, raise the tick count until it passes, at most 800, and say so in the decisions file. If seed 3 still ends with only Inem after one attempt, do not iterate: relax the assertion to at least 1 Asisten at 400 ticks (any hired at some point counted via the final state), and write `Asisten wages too steep before RW` in `decisions/wacana-staff-core-T1.md` for T6.
- Done when: `npm run typecheck` and `npm test` pass. The new test fails without `staffWhen` and passes with it. `decisions/wacana-staff-core-T1.md` and `progress/wacana-staff-core-T1.md` exist. If any other test fails, set status `stopped` with the failing test names and numbers. Do not edit those tests.
- Don't touch: `src/`, other bots' plans, GAME-DESIGN.md, TODO.md. No e2e needed.

### T2. Programs count in the quarterly ranking (Sonnet, executor trial)
- Files: `src/data/ranking.ts`, `src/sim/ranking.ts`, `src/sim/neighbourView.ts`, `src/data/realisasi.ts`, `tests/grow.test.ts`, `tests/wacana-ranking.test.ts`, `GAME-DESIGN.md`
- Exact changes:
  - `src/data/ranking.ts`: in `SCORE`, add `perWacana: 6, perRealisasiLive: 20, perRealisasiDone: 5`.
  - `src/sim/ranking.ts`: add and export `programScore(s: GameState): number`. It returns `SCORE.perWacana` × the sum over `s.wacana` of `w.power / WACANA_POWER`, plus `SCORE.perRealisasiLive` × `liveRealisasi(s).length`, plus `SCORE.perRealisasiDone` × `realisasiDone(s)`. Import those from `src/data/wacana.ts` and `src/sim/realisasi.ts`. Add `programScore(s)` inside the `Math.round(...)` of `score()`. Add `programs: Math.round(programScore(s))` to the object `scoreParts()` returns, and to its return type.
  - `src/sim/neighbourView.ts`: in both `playerCellView` and `viewOf`, add `wacana: [], realisasi: []` next to `emas: 0`. AI RTs run no programs, and the player's programs already count in the player's score.
  - `src/data/realisasi.ts`: in the header comment, `Promotion reads the Laporan; the ending` becomes `The quarterly ranking reads programs; the ending`.
  - New `tests/wacana-ranking.test.ts`, with three tests:
    - A new game's `score()` rises after `announce(s, 'hijau')`, with enough rupiah given first.
    - After 30 runs of `wacanaSystem` with a throwaway fx array, the gain is back to 0.
    - `score(viewOf(s, s.neighbours[0]))` is the same before and after the player announces.
    - Build the state the way `tests/grow.test.ts` does for its `scoreParts` test.
  - `tests/grow.test.ts`: in the test `explains a score by its parts`, add `+ p.programs` to the sum of parts. Change nothing else.
  - `GAME-DESIGN.md` §4, in the **Wacana or Realisasi** bullet, after `only doing moves Sejahtera.` add: ` The quarterly ranking counts programs too: each wacana by its current approval (6 points at full), each Realisasi at work 20, and each one carried out 5 for good.`
- Done when: `npm run typecheck` and `npm test` pass, and the first new test fails without the `score()` change. `decisions/wacana-staff-core-T2.md` and `progress/wacana-staff-core-T2.md` exist. If a balance, pacing, ranking or bot test fails, set status `stopped` with the failing test names and numbers. Do not edit those tests.
- Don't touch: `laporan()`, `EMAS`, `WIN`, `LOSE`, `RIVAL_*`, star goals, UI, TODO.md. No e2e needed.

### T3. A PIC for every Wacana and Realisasi, sim only (Sonnet, executor trial)
- Files: `src/sim/types.ts`, `src/sim/staff.ts`, `src/sim/wacana.ts`, `src/sim/realisasi.ts`, `src/data/staff.ts`, `src/i18n/en.ts`, `src/i18n/id.ts`, `tests/program-pic.test.ts`, `GAME-DESIGN.md`
- Exact changes:
  - `src/data/staff.ts`: add and export `PIC = { gaulBase: 0.5, rajinBase: 1.5, leakBelow: 60, leakMax: 0.3, leakShare: 0.2, busyOutput: 0.5 }`, with a one-line comment for each value.
  - `src/sim/types.ts`: add `pic?: number` (the staff id) to `RealisasiState`. Add `leading?: string` (the Realisasi id they lead, until it lands) to `Staff`.
  - `src/sim/staff.ts`:
    - Export the local `roll` helper.
    - Add and export `picCandidates(s: GameState, stat: StatId): Staff[]`. Call `ensureStaff(s)`. Return staff with no `away`, and, for `stat === 'rajin'`, no `leading`. Sort by that stat, high first, then by `id`. Always include Inem, even when `leading`, so the list is never empty.
    - Add and export `wacanaPicMult(x: Staff): number`, which returns `PIC.gaulBase + x.stats.gaul / 100`.
    - Add and export `realisasiDelay(base: number, x: Staff): number`, which returns `Math.max(1, Math.round(base * (PIC.rajinBase - x.stats.rajin / 100)))`.
    - In `output(x)`, after the `away` check, multiply the result by `PIC.busyOutput` when `x.leading` is set.
  - `src/sim/wacana.ts`: `announce(s, id, picId?: number)`. The PIC is the staff member with `picId`, or else `picCandidates(s, 'gaul')[0]`. Multiply the new `w.power` by `wacanaPicMult(pic)`. The existing two-argument calls in tests keep working.
  - `src/sim/realisasi.ts`:
    - `startRealisasi(s, id, picId?: number)`. The PIC is the staff member with `picId` if they are in `picCandidates(s, 'rajin')`, or else the first candidate. Use `realisasiDelay(d.delay, pic)` in place of `d.delay`. Store `pic: pic.id`. Set `pic.leading = id`, unless `pic.inem`, because Inem can lead many.
    - In `realisasiSystem`, when a program lands (`r.landsAt === s.month`), find its PIC. Clear their `leading`. Raise their `rajin` by 1, up to `STAT_MAX`. Then roll the leak: if `pic.stats.jujur < PIC.leakBelow` and `roll(s, s.month, 300 + pic.id) < PIC.leakMax * (PIC.leakBelow - pic.stats.jujur) / PIC.leakBelow`, lose `price(s, d.cost) * PIC.leakShare` rupiah through `gain`. Push a bad notice with title `t('staff.mishapTitle', { name, stat: t('staff.stat.jujur'), n, what: t('real.leakWhat') })` and body `t('real.leakBody')`.
  - `src/i18n/en.ts`: add `'real.leakWhat': 'some of the program budget went missing'` and `'real.leakBody': 'Low Jujur lets money slip. Pick an honest lead next time.'`.
  - `src/i18n/id.ts`: add `'real.leakWhat': 'sebagian dana program raib'` and `'real.leakBody': 'Jujur yang rendah bikin dana bocor. Pilih PIC yang jujur lain kali.'`.
  - New `tests/program-pic.test.ts`, with these tests:
    - Gaul 80 gives 1.3 times the power of Gaul 50.
    - Rajin 80 turns a 3-week delay into 2. Rajin 20 turns it into 4.
    - A lead is busy until the program lands: `output` halves, then returns to full.
    - A busy lead is not offered for a second Realisasi.
    - Inem is always a candidate.
    - A Jujur 10 lead leaks on some seed within 50 seeds, and a Jujur 70 lead never does.
    - Landing raises the lead's Rajin by 1.
  - `GAME-DESIGN.md` §4, after the **Wacana or Realisasi** bullet, add a new bullet: `- **PIC:** every program has a lead from your staff, preselected as the best free person for the stat; Inem can always lead. A wacana's lead sets how much it lands (×0.5 + Gaul/100). A Realisasi's lead sets how fast (delay × (1.5 − Rajin/100), at least 1 week), works at half output until it lands, then gains 1 Rajin; below Jujur 60 they may lose 20% of the budget (up to a 30% chance at Jujur 0).`
- Done when: `npm run typecheck` and `npm test` pass, and the new tests fail on main. `decisions/wacana-staff-core-T3.md` and `progress/wacana-staff-core-T3.md` exist. If a balance, pacing or bot test fails, set status `stopped` with the failing test names and numbers. Do not edit those tests.
- Don't touch: `src/ui/`, `src/app.ts`, ranking, desk queue, staff requests, saves, TODO.md. No e2e needed.

### T4. Show and change the PIC in the Wacana pop-up (Sonnet, executor trial)
- Files: `src/ui/panels.ts`, `src/style.css`, `src/i18n/en.ts`, `src/i18n/id.ts`, `tests/e2e/ui.spec.ts`
- Exact changes:
  - `src/ui/panels.ts`, in `openWacanaDetail`, keep a module-level `picChoice: Record<string, number>` keyed by `` `${id}:announce` `` and `` `${id}:realisasi` ``.
  - In each column, above its action button, add one row: `h('div', { class: 'wac-pic', 'data-pic': <col> }, …)`. It shows:
    - the lead's name;
    - the stat icon (`STAT_ICON` and `iconURL`, as `src/app.ts` does for `send-odds`) with the stat value;
    - the effect. For the announce column, use `t('wac.picPower', { x: wacanaPicMult(pic).toFixed(1) })`. For the Realisasi column, use `t('wac.picWeeks', { n: realisasiDelay(d.delay, pic) })`.
  - After the row, add a small secondary button `t('wac.picNext')` with `data-pic-next`. It moves to the next person in `picCandidates(s, stat)`, wrapping at the end, stores the choice in `picChoice` and redraws with `openWacanaDetail(app, id)`. Hide the button when there is only one candidate.
  - Pass the chosen id to `announce(s, id, pick)` and `startRealisasi(s, d.id, pick)`.
  - `src/style.css`: add `.wac-pic { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }`.
  - `src/i18n/en.ts`: add `'wac.picPower': '×{x} approval'`, `'wac.picWeeks': 'works in {n} wk'` and `'wac.picNext': 'Change'`.
  - `src/i18n/id.ts`: add `'wac.picPower': '×{x} approval'`, `'wac.picWeeks': 'jalan dalam {n} mg'` and `'wac.picNext': 'Ganti'`.
  - `tests/e2e/ui.spec.ts`: add one test beside the existing Wacana tests. Open Menu, Wacana and the first policy. Expect two `.wac-pic` rows that name Inem. With only Inem on staff, expect no `[data-pic-next]` button. Use the existing helpers and `test` from `./fixtures`.
- Done when: `npm run typecheck` and `npm test` pass. `npx playwright test tests/e2e/ui.spec.ts -g Wacana` passes on the default project and with `--project=phone-412-en`. The pop-up keeps exactly one primary button. `decisions/wacana-staff-core-T4.md` and `progress/wacana-staff-core-T4.md` exist. If the UI rule 13 or 14 scan fails on the Wacana screen, set status `stopped` with the word count. Do not add an allowlist entry.
- Don't touch: `src/sim/`, the Wacana list rows, other panels, TODO.md.

### T5. The desk queue grows with the stage (Sonnet, executor trial)
- Files: `src/data/staff.ts`, `src/sim/rules.ts`, `tests/desk.test.ts`, `GAME-DESIGN.md`
- Exact changes:
  - `src/data/staff.ts`: add and export `PERMIT_STAGE_MULT: Record<StageId, number> = { rt: 1, rw: 1.5, kelurahan: 2, kecamatan: 2.5 }`, with the comment `/** A bigger area files more paperwork: permit folders grow with the stage, so one Asisten falls behind from the RW. */`.
  - `src/sim/rules.ts`, in the line that sets `b.timer`, change `d.permitMonths > 0 ? d.permitMonths :` to `d.permitMonths > 0 ? Math.max(1, Math.round(d.permitMonths * PERMIT_STAGE_MULT[s.stage.current])) :`.
  - `tests/desk.test.ts`: add one test. Place the same permit building in an RT state and in an RW state (read how other tests load a stage state, for example `tests/grow.test.ts`). Expect the RW building's `timer` to be `Math.round(permitMonths * 1.5)`, and the RT one's to equal `permitMonths`.
  - `GAME-DESIGN.md` §4, in the **Desk queue** bullet, after `one per permit month,` add ` times the stage (RT ×1, RW ×1.5, Kelurahan ×2, Kecamatan ×2.5),`.
- Done when: `npm run typecheck` and `npm test` pass, and the new test fails on main. `decisions/wacana-staff-core-T5.md` and `progress/wacana-staff-core-T5.md` exist. If a balance, pacing, stage or bot test fails, set status `stopped` with the failing test names and numbers. Do not edit those tests.
- Don't touch: `berkasPerOutput`, `floor`, `hireAfter`, Inem's wage, TODO.md. No e2e needed.

### T6. Tune with the Nightly scorecard (Sonnet thread, not executor)
- After T1 to T5 merge, read the next Nightly scorecard against the one before T1.
- Bars:
  - `pencitraan` wins no more rankings than `builder`.
  - `honest` wins at least as many as before T2.
  - The hiring bots stay inside their GAME-DESIGN.md §3 bands.
  - `cheapskate` still reaches RT 2★ and never soft-locks.
  - A builder with `hire: false` reaches RW 3★ and Kel 3★ at least 15% later than the hiring builder.
- Tune only `SCORE.perWacana`, `perRealisasiLive`, `perRealisasiDone`, `PIC` and `PERMIT_STAGE_MULT`. Log the numbers in `decisions/wacana-staff-core-T6.md`.

## Open questions
- Should Sekretaris become the main Orang Inside source and Admin Grup WA the main Viral source (full option B)? Revisit after the playtest.
- Wacana still lives behind the Menu. If players still skip it, add a ranking preview line on the goal strip ("Kampung Sebelah leads by 40. A wacana adds about 6."). This needs a UI.md check first.
- Option C (a Kairosoft-style board of secondary goals from Pak Camat) is in TODO.md Later.
- Two more systems have the same flaw (checked 2026-11-09):
  - **Sejahtera and the Kerja meter** feed only the 2045 meter and a drop toast. Perut and Aman do more: hunger costs Popularitas, and Aman feeds preman, Lomba, inspections and the Kecamatan goals. So a Realisasi that moves Kerja changes nothing, and the 2045 ending that reads Sejahtera isn't built.
  - **Indonesia Emas %** adds `perEmas` 20 × its value (0.01 at the start, a fraction of a percent later) to the ranking. That is a point or two, against 8 for each resident.
  - Both are in TODO.md Later as one item, because they need a design call.
