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
- Done when: `npm run typecheck` passes; `npx vitest run tests/kec-bot.test.ts` passes; a one-off local run of `playKecHint(1, 300)` (not committed) reports `pinjol` below 41; `decisions/playtest-bot-gaps-T1.md` and `progress/playtest-bot-gaps-T1.md` exist.
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
