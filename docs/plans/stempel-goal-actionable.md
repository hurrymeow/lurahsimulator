# Make the Stempel goal actionable

## Goal
Hari (2026-11-01, playtest screenshot) could not tell what "jaga Stempel di bawah 5, 6 minggu" meant or what to do. The hint under it ("build Warung Sembako to attract residents") belonged to the residents goal. Fix the wording, the hint, the "on track" state and the explainer. Judged against UI.md (plain words, one idea per line) and GAME-DESIGN.md (Stempel: 3 a month, +1 per Balai RW, each waiting letter costs 0.5 Sabar). Run on the DeepSeek executor (Hari: "use ds to do").

## Decisions
- In `have` of the goal line, `stempelClear` counts weeks held (`s.stempel.clear`), not letters waiting. The old text hid the letters waiting, so the line now shows both.
- "Stempel" stays the player-facing word. The explainer defines it in one line.
- Order: T1 first (adds `backlog` var and strings). T2, T3, T4 each depend on T1 being merged. Run one at a time.

## Tasks

### T1. Reword the Stempel goal and show letters waiting (Sonnet, executor trial)
- Files: `src/sim/stages.ts`, `src/i18n/en.ts`, `src/i18n/id.ts`, `tests/higher.test.ts`
- Exact changes: in `starChecklist` in `src/sim/stages.ts`, add `backlog: s.stempel.backlog` to the `vars` object. Replace these four strings. EN `stage.goal.stempelClear`: `Keep Stempel letters waiting under {under} for {n} weeks (held {have}, {backlog} waiting now)`. EN `stage.goalShort.stempelClear`: `keep Stempel letters waiting under {under}, {n} weeks`. ID `stage.goal.stempelClear`: `Jaga surat Stempel yang menunggu di bawah {under} selama {n} minggu (bertahan {have}, kini {backlog} menunggu)`. ID `stage.goalShort.stempelClear`: `jaga surat Stempel menunggu di bawah {under}, {n} minggu`. If the i18n key check needs `backlog` declared anywhere, add it there. In `tests/higher.test.ts` update the one expectation at the "prints the RW checklist" test to `'Keep Stempel letters waiting under 5 for 6 weeks (held 0, 0 waiting now)'`.
- Done when: `npm run typecheck` and `npm test` pass; `decisions/stempel-goal-actionable-T1.md` and `progress/stempel-goal-actionable-T1.md` exist.
- Don't touch: other strings, goal.ts, nextstep.ts, STEMPEL numbers, TODO.md. No e2e needed.

### T2. A hint that matches the Stempel goal (Sonnet, executor trial)
- Files: `src/sim/nextstep.ts`, `src/ui/goal.ts`, `src/i18n/en.ts`, `src/i18n/id.ts`, `tests/nextstep.test.ts`
- Exact changes: add `'stempel'` to `StepKind`. In `nextStep`, right after the first-house check, when `s.stage.current !== 'rt'` and every open goal in `nextStarChecklist(s)` has kind `stempelClear`: return `{ kind: 'stempel', text: t('goal.short.stempel') }` when `s.stempel.backlog >= STEMPEL.clearUnder - 1` (import `STEMPEL` from `./balance`), otherwise return `null` so no unrelated hint shows. In `src/ui/goal.ts` add `step.kind === 'stempel'` to the `stepLeads` list. Strings: EN `goal.short.stempel`: `letters are piling up: run a Calo job or build a Balai RW`. ID `goal.short.stempel`: `surat menumpuk: jalankan Calo atau bangun Balai RW`. Tests in `tests/nextstep.test.ts`: (a) RW stage, `fundedRts` met, backlog 0: `nextStep` is null. (b) same, backlog 4: kind `stempel`. (c) RW stage with `fundedRts` still open keeps its old behaviour (no `stempel` kind).
- Done when: `npm run typecheck` and `npm test` pass; the three new tests pass and (b) fails without the nextstep change; `decisions/stempel-goal-actionable-T2.md` and `progress/stempel-goal-actionable-T2.md` exist.
- Don't touch: RT-stage hints, other step kinds, balance numbers, TODO.md. No e2e needed.

### T3. Show "on track" when the Stempel goal is holding (Sonnet, executor trial)
- Files: `src/sim/stages.ts`, `src/ui/goal.ts`, `src/i18n/en.ts`, `src/i18n/id.ts`, `tests/higher.test.ts`
- Exact changes: add `holding: boolean` to `ChecklistLine`, true when `goal.kind === 'stempelClear'`, the line is not done and `s.stempel.backlog < goal.under`; false otherwise. In `src/ui/goal.ts`, the opened goal row for a holding line reads `★ {text} · {t('goal.onTrack')}`. Strings: EN `goal.onTrack`: `on track, keep it up`. ID `goal.onTrack`: `aman, pertahankan`. Test in `tests/higher.test.ts`: RW stage with `fundedRts` done: `holding` is true at backlog 0, false at backlog 5.
- Done when: `npm run typecheck` and `npm test` pass; `decisions/stempel-goal-actionable-T3.md` and `progress/stempel-goal-actionable-T3.md` exist.
- Don't touch: other goal kinds, the goal pill text (closed state), TODO.md. No e2e needed.

### T4. Tap the goal to learn what Stempel is (Sonnet, executor trial)
- Files: `src/ui/goal.ts`, `src/i18n/en.ts`, `src/i18n/id.ts`, `tests/i18n.test.ts`
- Exact changes: in the opened state of the goal in `src/ui/goal.ts`, when a `stempelClear` line is open, add one more row `h('p', { class: 'goal-row goal-step' }, t('goal.stempelHelp', { base: STEMPEL.base, perBalai: STEMPEL.perBalai }))` after the goal rows. Strings: EN `goal.stempelHelp`: `Neighbour RTs send you a letter for each build. Each letter needs a Stempel. You get {base} a month, +{perBalai} per Balai RW.` ID `goal.stempelHelp`: `RT tetangga mengirim surat tiap membangun. Tiap surat butuh satu Stempel. Kamu dapat {base} sebulan, +{perBalai} per Balai RW.` Check whether `tests/i18n.test.ts` already enforces matching keys and variables across languages; if so it covers the new keys and needs no edit.
- Done when: `npm run typecheck` and `npm test` pass; `decisions/stempel-goal-actionable-T4.md` and `progress/stempel-goal-actionable-T4.md` exist. CI runs the e2e text and overflow scans in Indonesian; the PR body must say the row was not checked at 320px by hand.
- Don't touch: the closed goal pill, other rows, TODO.md. No local e2e.
