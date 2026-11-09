# Playtest bot gaps

## Goal
Fix two bot gaps found by the first-2h playtest (Hari, 2026-11-08: "fix all, use deepseek"). Bot fixes only. No `src/` change. Real game findings are reported separately after the rerun.

## Evidence
- Kecamatan bot (seed 1, hint path, 300 weeks after promotion): 0 stars. Goal lines: Kantor Kec, Kelurahan stars and 250 residents are done. Only "pinjol under 25" fails (41%). At the end the bot holds Rp 60M, Viral 85, 0 Koperasi Simpan Pinjam, 0 Balai Latihan Kerja, 0 Literasi Keuangan runs, 26% jobless. The bot never uses the pinjol tools the game gives a player. Judol sits at 74% (Viral 85 feeds it).
- Screen bot (nightly 360 ID): 23/75 right (31%). Stuck on "combo Rapat Malam: Kantor RT, Pos Ronda". Kantor RT costs Rp 5M and is locked. The bot builds Pos Ronda again and again (Rp 800k each, three times) instead of saving. The scorer then marks every forced wait "wrong" because no line moved.

## Tasks

### T1. Kecamatan bot uses the pinjol tools (Sonnet, executor trial)
- Files: `tests/kec-bot-lib.ts`, `tests/kec-bot.test.ts`
- Exact changes: in `kecWeek`, when `stage === 'kecamatan'` and the Kantor Kecamatan stands: (a) call `makeRoomFor(s, 'koperasiSP', [...seam, ...all])` while fewer than 2 `koperasiSP` buildings exist; (b) call `makeRoomFor(s, 'balaiLatihanKerja', [...seam, ...all])` while none exists; (c) when `pinjolShare(s) >= 20` and `checkRealisasi(s, 'literasiKeuangan').ok`, call `startRealisasi(s, 'literasiKeuangan')`. Import `checkRealisasi` and `startRealisasi` from `../src/sim/realisasi`. Do this before the `kelWeek` call. In `tests/kec-bot.test.ts` add no new slow test; keep the existing ones passing.
- Done when: `npm run typecheck` passes; `npx vitest run tests/kec-bot.test.ts` passes; you may check with a one-off `playKecHint(1, 300)` run (takes ~4 min), but any scratch test file you create MUST be deleted before you finish: the gate rejects files outside the Files list; `decisions/playtest-bot-gaps-T1.md` and `progress/playtest-bot-gaps-T1.md` exist.
- Don't touch: `src/`, other bot files, scorecard files, TODO.md. No e2e.

### T2. Screen bot saves instead of rebuilding (Sonnet, executor trial)
- Files: `tests/e2e/screen-bot.ts`, `tests/screen-bot.test.ts`
- Exact changes: in `decide`, in the fallback that builds another owned building ("own N and the star still waits"), skip it when any other name in `seen` is locked and owned 0 (the player is saving for it). In that case return `wait` with why `saving for: <names>`. Text and cards only. Do not read state. Add a unit test: goal row names `Kantor RT, Pos Ronda`, Pos Ronda owned 1 and unlocked, Kantor RT locked and owned 0, expects `wait`; and the same with Kantor RT unlocked expects `build` Kantor RT.
- Done when: `npm run typecheck` and `npx vitest run tests/screen-bot.test.ts` pass; the "never touches the debug handle" test still passes.
- Don't touch: the scorer, the spec, `src/`.

### T3. Scorer counts a wait forced by money (Sonnet, executor trial)
- Files: `tests/e2e/screen-bot-score.ts`, `tests/e2e/screen-bot.spec.ts`, `tests/screen-bot.test.ts`
- Exact changes: `score` gets an optional fourth argument `unaffordable?: boolean`. For kind `wait`, when it is true, the verdict is `right` with reason `saving: could not afford the named building`. In the spec, compute it for each wait row from the row's `before` snapshot only: map every building name the row's visible text names to its def (`allDefs`, `bName`), keep those with none owned in `before.buildings`, and set true when every such def costs more than `before.res.rupiah` (use `buildCost(before, def)` from `src/sim/state`). The player code is not changed and receives nothing from this. Add a unit test for the new argument.
- Done when: typecheck and `npx vitest run tests/screen-bot.test.ts` pass.
- Don't touch: `tests/e2e/screen-bot.ts`, `src/`.

### Rerun. Rerun and report (me)
Nightly after T1, T2 and T3 merge. Report real game findings (Kecamatan 1★ reachable? Kantor RT cost vs RT 1★ pacing) separately from bot fixes, in `decisions/playtest-bot-gaps.md`.

## Round 2 (after the first Nightly rerun, 2026-11-09)
T1 landed but pinjol got worse (56 to 70% at 700 weeks, 0 stars on 10 of 10 seeds). Local diagnosis at 200 weeks, seed 1: 154 households, food for 50 (`fedBase`), 102 in debt, 1 Koperasi and 1 Balai Latihan Kerja working, 4 Literasi runs. A household whose food is missing counts as hungry and borrows. The bot grows to 460 residents and never adds food. A player sees the meter and builds more Warung.

### T4. Kecamatan bot keeps households fed (Sonnet, executor trial)
- Files: `tests/kec-bot-lib.ts`
- Exact changes: import `fedBase` and `households` from `../src/sim/needs`. In `kecWeek`, for `stage === 'kecamatan'`: when `fedBase(s) < households(s)` call `makeRoomFor(s, 'tokoKelontong', [...seam, ...all])` and, if that placed nothing (building count unchanged), `makeRoomFor(s, 'warung', [...seam, ...all])`. Also treat the kampung as `full` (no new homes) while `fedBase(s) < households(s)`. Keep the rest.
- Done when: `npm run typecheck` and `npx vitest run tests/kec-bot.test.ts` pass. Delete any scratch file you make.
- Don't touch: `src/`, other files.

## Finding (screen bot, not fixed): combo pieces are not placed side by side
After T2 and T3 the screen bot still scores 31% (49 checkpoints, 15 right) and never reaches RT 3★. It owns Kantor RT and four Pos Ronda, the "Rapat Malam" combo never forms, and 17 later taps fail (Pos Ronda cap). The bot taps spots round the map middle and does not place a piece beside its partner. The screen shows the pieces to place "side by side" but not where. Fixing it needs a design call: make the bot find an adjacent tile on the canvas (tile geometry from the screen), or accept that a new player also has to find the spot. Reported to Hari, not built.
