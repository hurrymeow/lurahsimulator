# Playtest of the first 2 hours

Approved by Hari, 2026-11-08 ("go pls try using sonnet / haiku"). Planning thread: "Plan a playtest of the first 2 hours".

## Goal

Test the first 2 hours at 1x, bands B0 to B5 (RT 0★ through Kecamatan 3★), against GAME-DESIGN.md §8 and the UI.md review checklist. Every Pass or Fail links an artifact (TESTING.md item 16). The scorecard of 2026-11-04 (3 Pass, 14 Fail, 10 Unknown) is the baseline: the report lists deltas and new findings, not the known fails again.

## Decisions and why

- **Four layers.** Bots give numbers across seeds. A screen-only bot checks what bots miss: whether the screen alone names the next action for a star. Screen walks check the UI rules per stage. Hari checks feel only.
- **No LLM judges anything.** The screen-only bot parses visible text and a separate scorer grades it against sim state. This avoids the 2026-10-28 AI playtest problem: free-text opinions with nothing attached, graded by the agent that played.
- **Kecamatan bars use the hint path.** The hint bot reaches Kel 3★ on 10/10 seeds (about 38 min). Builder reaches it on 2/10, shopkeeper on 5/10. Bot gaps are logged, not counted as game fails.
- **Save loading:** add a Kecamatan seed to the existing Settings, Developer row (`decisions/dev-seeds.md`). It works on a phone, unlike a console paste. This replaces the `?debug&load=` idea from the chat draft, since the Developer row already exists.
- **Screen-only bot widths:** 412 EN and 360 ID. 320 in both languages doubles cost; the screen walks cover 320.
- **Models:** Sonnet and Haiku only (Hari). No Opus execution.
- Opinions go in a separate, labelled section of the report.

## Tasks

### T1. Fresh scorecard plus open Kecamatan rows (Sonnet)
- Files: `tests/scorecard/scorecard.ts`, `tests/scorecard/plan.ts`, `tests/kec-bot-lib.ts`, `tests/kec-bot.test.ts`, `.github/workflows/nightly.yml` (read; edit only if needed).
- Do: dispatch Nightly on current main. Add to the report a B0 to B5 band table (novelty max, goal max, star gap, stop point per band, per bot). Measure the three open Kecamatan rows from `decisions/kecamatan-playtest.md`: first pinjol case within 3 min of promotion, a stop point every 20 min, judol share and Baliho income. Run the Kec bot on 10 seeds via the hint path.
- Done when: `scorecard/scorecard.md` regenerated on main by Nightly, with the band table and the three Kec rows filled (number or a stated reason). Unit tests green.
- Don't touch: `src/` game numbers or text. No balance changes in this task.

### T2. Screen-only bot (Sonnet)
- Files: new `tests/e2e/screen-bot.spec.ts`, helpers in `tests/e2e/` as needed, `playwright.config.ts` (a nightly-only project), `.github/workflows/nightly.yml`.
- Do: Playwright plays the built app with no `window.pakrt` reads and no `?debug` state access during play (debug only to skip timers is OK if documented). Each 60s of game time, and after each star or popup, it records from visible text only: the action it will take for the next star. Then it does that action by tapping. After the run, a separate scorer reads the sim timeline and marks each checkpoint right (the action moves an unmet star line) or wrong. Every wrong or "can't tell" checkpoint saves a screenshot. Run at 2x. Projects: 412 EN and 360 ID.
- Done when: a Nightly artifact holds a CSV (time, visible goal text, chosen action, verdict) and miss screenshots. Pass bar: at least 90% of checkpoints correct, and RT 3★ inside the 9 to 12 min builder band (1x equivalent). The spec runs in Nightly only, not in PR CI.
- Don't touch: `src/`. If the screen does not expose a needed label, log it as a finding, don't add it.

### T3a. Kecamatan dev seed (Sonnet)
- Files: `tests/seed-bot.ts`, `tests/seed.test.ts`, new `src/sim/seeds/kec.json`, `src/ui/settings.ts`, `src/i18n/` (one button label, EN and ID), `tests/e2e/ui.spec.ts` (the Developer row test).
- Do: add a fourth Developer button that loads a Kecamatan start (0★, just promoted). Same two-tap confirm and lazy chunk as the others.
- Done when: typecheck, unit tests, and `ui.spec.ts` at `phone-412-en` and `phone-360` pass. The button loads a Kecamatan game on the live site.
- Don't touch: the other seeds' content, game balance.

### T3b. Screen walks per stage (Sonnet, after T3a)
- Files: copy `/mnt/project-files/audit/ui-rules-2026-11-01/audit.spec.ts` and `audit.config.ts` to `/mnt/project-files/audit/first-2h/`. Not in the repo.
- Do: for each Developer seed (RT 3★, RW, Kelurahan, Kecamatan) plus a fresh game, screenshot every sheet at 320 and 412 in EN and ID. Score against the UI.md review checklist: glance test (at most 9 readouts in the two top rows), unmet requirements name what is missing (rule 9), a way out of every sheet, rule 13 word limits, no cut-off or overlapping text.
- Done when: `/mnt/project-files/audit/first-2h/report.md` lists each check as Pass or Fail with a screenshot link.
- Don't touch: repo code. Findings go to the report.

### T4. Hari's hands-on (Hari, no thread)
- Session 1: fresh game, 15 min, on a phone. Session 2: Settings, Developer, Kecamatan, 15 min.
- Answer the §8 T3 questions, plus "what was your next move for a star?" at minute 5 and minute 10.
- Mark any T1 to T3b row you disagree with.

### T5. Report (Haiku)
- Files: new `decisions/first-2h-playtest.md`. Inputs: `scorecard/scorecard.md`, the T2 Nightly artifact, `/mnt/project-files/audit/first-2h/report.md`, Hari's T4 answers.
- Exact changes: one table per layer (row, bar, result, verdict, artifact link), a "Changed since 2026-11-04" list, a "New findings" list, and an "Opinions (labelled)" section. New findings go to TODO.md in a separate docs-only change.
- Done when: the file is on main and every Pass or Fail links an artifact.
- Don't touch: GAME-DESIGN.md, UI.md, TESTING.md, TODO.md in the same commit.

## Order

T1, T2 and T3a run in parallel. T3b follows T3a. T4 follows T3a deploy. T5 last.

## Open questions

- If T2 scores under 90%, is the fix the goal strip text, or the bar? Plan a fix after the result, not before.
- Kecamatan slice 2 waits on T4 session 2 and the T1 Kec rows.
