# Calm the floating income pops

## Goal

At Kecamatan scale, money and heart pops from every building cover the whole map (Hari's screenshot, 2026-11-09). Make the pops calm enough that the map stays visible, in the Kairosoft style.

## Decisions and why

- **Money pops show earnings only (Hari, option A).** A building whose net money for the tick is zero or negative gets no money pop. Upkeep and losses stay off the map. The money chip and the monthly report carry the totals. Why: about half the wall was red minus numbers, and Kairosoft shows costs in the report, not over each shop.
- **No black box behind pops (Hari).** Each number gets a 2px dark outline instead. Why: the box is what turns many pops into a solid wall. Outlined text covers far less map and stays readable on grass and roofs.
- **Unchanged:** non-money pops (hearts and others) keep both signs. The cost pop on placement stays. Job and level-up pops stay.
- **Not doing now:** a cap on pops on screen, round-robin, skip-instead-of-stack, zoom-aware labels, a monthly net delta on the money chip. Revisit after Hari plays with T1 and T2 live.

## Doc changes (in T1's PR)

UI.md, checklist item 12 "Consequence shows where it happens":
- "Good here" becomes: a coin pop over the building that earned, at most one per building per second. Upkeep and losses show in the money chip and the report, not on the map.
- "Pass" becomes: ≥90% of per-building positive income events get a pop. Never over 1 pop per building per second. No money pop for upkeep or a loss.

## Tasks

### T1. Money pops for earnings only, and the UI.md amendment (Haiku)
- Files: `src/app.ts`, `UI.md`, `decisions/calm-income-pops.md` (new), `progress/calm-income-pops-T1.md` (new)
- Exact changes:
  - `src/app.ts`, in `handleFx`: replace the line
    `    for (const p of pops.values()) if (Math.abs(p.amount) >= (p.res === 'rupiah' ? 1 : 0.5)) this.view.pop(p.x, p.y, p.res, p.amount);`
    with
    `    // Money pops show earnings only. Upkeep and losses stay off the map (decisions/calm-income-pops.md).`
    `    for (const p of pops.values()) if (p.res === 'rupiah' ? p.amount >= 1 : Math.abs(p.amount) >= 0.5) this.view.pop(p.x, p.y, p.res, p.amount);`
  - `UI.md`, item 12: replace the "Good here" line with
    `- **Good here:** a coin pop over the building that earned, at most one per building per second. Upkeep and losses show in the money chip and the report, not on the map.`
    and the "Pass" line with
    `- **Pass:** ≥90% of per-building positive income events get a pop. Never over 1 pop per building per second. No money pop for upkeep or a loss.`
  - `decisions/calm-income-pops.md`: copy the "Decisions and why" section of this plan, with a link to this plan.
  - `progress/calm-income-pops-T1.md`: one paragraph on what shipped.
- Done when: `npm run typecheck` and `npm test` pass; `npx playwright test tests/e2e/ui.spec.ts --project=phone-412` passes; `git diff src/app.ts` shows exactly one changed line plus one added comment line.
- Don't touch: the cost pop in the placement code (`this.view.pop(g.x, g.y, 'rupiah', -cost)`), `flyCoins`, `src/sim/`, any other UI.md item, TODO.md. No refactors. Known failures on main: none. If a check fails for a reason outside this change, push and report.

### T2. Outline instead of the black box (Haiku)
- Files: `src/render/map.ts`, `progress/calm-income-pops-T2.md` (new)
- Exact changes: in the pop drawing loop (after `const py = base - ...` and `ctx.globalAlpha = ...`), replace these five lines
  ```
        ctx.fillStyle = 'rgba(11, 11, 12, 0.85)';
        ctx.fillRect(cx - w / 2 - 2, py - 10, w + 4, 20);
        ctx.drawImage(sprite(p.res, undefined, ICONS), cx - w / 2 + 2, py - 5, 10, 10);
        ctx.fillStyle = RES_COLOUR[p.res];
        ctx.fillText(p.text, cx + 6, py + 1);
  ```
  with
  ```
        // No box: a 2px dark outline keeps the number readable on grass and roofs (decisions/calm-income-pops.md).
        ctx.drawImage(sprite(p.res, undefined, ICONS), cx - w / 2 + 2, py - 5, 10, 10);
        ctx.lineJoin = 'round';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#0b0b0c';
        ctx.strokeText(p.text, cx + 6, py + 1);
        ctx.fillStyle = RES_COLOUR[p.res];
        ctx.fillText(p.text, cx + 6, py + 1);
  ```
  - `progress/calm-income-pops-T2.md`: one paragraph, plus one 320px Indonesian screenshot of the map with pops attached to the PR.
- Done when: `npm run typecheck` and `npm test` pass; `npx playwright test tests/e2e/visual.spec.ts tests/e2e/ui.spec.ts --project=phone-412` passes; `git diff src/render/map.ts` shows only the swap above.
- Don't touch: the collision nudge loop, `POP_MS`, `rise`, the font line, `RES_COLOUR`, the icon sprites, screenshot baselines. No refactors. If a visual baseline fails, push and report; do not update baselines from the executor.

T1 and T2 touch different files and can run in parallel. One executor run per task.

## Open questions

- After T1 and T2 are live: is the Kecamatan map calm enough, or do we add the cap with round-robin (option B) and skip-instead-of-stack (option C)?
- Should a loss-making building get some other cue, such as a small red badge, now that its minus pop is gone?
