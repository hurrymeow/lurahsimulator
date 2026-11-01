# Goal line: one goal at a time, "Goal: reach 10 residents"

Approved by Hari, 2026-11-01 (thread "Redesign the goal line").

## Goal

The goal pill on the map shows one plain sentence, such as "Goal: reach 10 residents" (ID "Target: capai 10 warga"). It never ends in "…". Tapping it shows progress and the other goals, as it does now.

## Problem

The current line, "★ berikutnya, 2 target lagi: 10 warga (punya 4)", is always cut. Measured in Pak Pixel 700 at 16px:

| Line | Width | Text room (sat view open) |
|---|---|---|
| ID now: "★ berikutnya, 2 target lagi: 10 warga (punya 4)" | 382px | 320px: ~188 · 360px: ~228 · 390px: ~258 · 412px: ~280 |
| EN now: "Next ★, 2 goals left: 10 residents (have 4)" | 332px | same |

The prefix uses most of the room, so the goal itself is cut. Hari: "truncated and dunno what it is".

## Decisions and why

- **One unmet goal at a time, in checklist order.** When it is done, the next one shows. The star check still reads every goal (`nextStarChecklist`), so nothing changes in the sim. The line does not rotate on a timer, because text that changes every few seconds is hard to read and pulls the eye from the map.
- **No ★, no "next star, N left" prefix.** These used most of the room and did not explain the goal (Hari).
- **"Goal:" / "Target:" label + a verb.** "10 warga" alone was unclear (Hari). Use "reach" over "have": it reads as something to do. Examples: "Goal: reach 10 residents", "Goal: find 2 combos", "Goal: build the Posyandu"; "Target: capai 10 warga", "Target: temukan 2 combo", "Target: bangun Posyandu".
- **No have/need on the closed pill.** Progress shows only on tap, to keep the line clean (Hari). Residents and Popularitas are already in the top bar, so the most common progress is still on screen.
- **Teaching steps keep leading** (first Rumah, first combo, desk queue, and the step when no star is left), as in `decisions/goal-strip-star-goals.md`. They get the same "Goal:" label: "Goal: build your first Rumah".
- **Wrap, never clip.** At 360px and up every line fits on one line. At 320px about half the goals run 5 to 50px over and wrap to a second line. Trimming them all to fit 320 would bring back terse labels like "10 warga", which Hari ruled out. The pill gets at most 2 lines.
- **Not the old "Kini:" line.** Hari rejected "Kini: capai 60 warga" in the goal-strip-star-goals change because it hid what the next star needed. This line is that star goal itself, and the tap still lists every goal left with have and need.
- **Tapped open, unchanged in content:** every unmet goal with have and need (the current `stage.goal.*` strings), then the "Next step" line when one helps.

```
Before (412px, ID):  ★ berikutnya, 2 target lagi: 10 warga (pu… ▾
After  (412px, ID):  Target: capai 10 warga ▾
After  (320px, EN):  Goal: build the ▾
                     Posyandu
Tapped:              Target: capai 10 warga ▴
                     ★ 10 warga (punya 4)
                     ★ 2 combo ditemukan (punya 0)
```

## Tasks

One PR, one Sonnet thread. It changes app code and text, so it goes through CI.

### 1. Short goal strings (EN and ID)
- Files: `src/i18n/en.ts`, `src/i18n/id.ts`, `src/sim/stages.ts`.
- Add `goal.label` ("Goal: {goal}" / "Target: {goal}") and a short verb form for each of the 20 goal kinds, as `stage.goalShort.<kind>`, beside the existing `stage.goal.<kind>` (keep those for the tapped rows). No have/need in the short form.
- Add a `short` text to `ChecklistLine` (or a helper) built from the new keys. The sim and checks stay unchanged.
- Step texts (`goal.short.*`) lose their final full stop and start lower case after the label. Shorten `goal.short.desk` to "post a lowongan for an Asisten" / "pasang lowongan Asisten".
- Done when: typecheck passes; each kind has an EN and ID short string; `tests/i18n` key parity passes.

### 2. Pill shows one goal with the label
- Files: `src/ui/goal.ts`.
- Closed line: `goal.label` with the step text when a step leads, otherwise the first unmet goal's short text. Drop `goal.left` and `goal.leftOne` (remove the keys).
- Tapped rows: unchanged.
- Done when: the closed pill never contains ★, a digit followed by "goals left" / "target lagi", or "have" / "punya".

### 3. Wrap to two lines, no ellipsis
- Files: `src/ui/console.css`, `src/ui/goal.ts`.
- `.cs-goal-float .goal-text`: wrap, at most 2 lines, no `text-overflow`. Remove `data-clamp` from the goal text.
- Keep the ▾ in its place at the end of the first line. The pill's min height stays 30px.
- Done when: at 320px ID and EN the longest short goal shows in full on at most 2 lines.

### 4. Docs (same PR)
- `UI.md` rule 5: the goal pill is no longer a clamp exception; it may wrap to 2 lines. The Combo card stays the only clamp.
- `GAME-DESIGN.md` main-screen section: the pill example becomes "Goal: reach 10 residents", "one goal at a time, up to 2 lines".
- New `decisions/goal-line-one-goal.md` and `progress/goal-line-one-goal.md`.
- Done when: no doc says the goal pill is clamped or shows "next ★".

### 5. Tests (same PR)
- `tests/e2e/ui.spec.ts`: the test at "the goal shows on one line…" (around line 151). Update it: the closed line starts with "Goal:" / "Target:", has no ★ and no have/punya. Tapped rows still contain "have" / "punya". Replace the one-line scroll check with: no ellipsis, at most 2 lines, fully inside the map.
- Add a unit test that renders every goal kind's short line in both languages, with stage values, and checks its width budget: fits 2 lines at 320px (≤ 2 × 188px, measured by character count as a proxy if no canvas).
- Run: `npm run typecheck`, `npm test`, `npx playwright test tests/e2e/ui.spec.ts` (id) and `--project=phone-320-en` (English text changes).
- Done when: those pass locally; CI green.

## Don't touch

- The star rules, `goalProgress`, `starsEarnable` and the order of goals in `src/data`.
- The satellite view, its fold button and the pill's position.
- Tutorial code (another thread owns the Skip button and tap-blocking).
- TODO.md.

## Open questions

- None blocking. If a short goal still needs 3 lines at 320px in ID, trim that one string; do not add a clamp.
