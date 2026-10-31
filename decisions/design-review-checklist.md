# Design review checklist

Date: 2026-10-31. Decided by Hari in the thread "Plan review checklists for game quality".

## What changed

- GAME-DESIGN.md gains section 8, a 27-item design review checklist. Each item has a question, why, Kairosoft pattern, good and bad, evidence tier and pass bar. Drafted in chat, reviewed by a second agent, then approved.
- Run length target: 8h of wall time for the core run. New Game+ is optional.
- Speeds: pause, 1x, 2x. 4x is removed. **Code pending:** `FAST_FROM_YEAR` in `src/app.ts` and the 4x picture in `src/ui/howto.ts`.
- Calendar: 8s becomes one week, not one month. A month is 4 weeks (32s), a year 48 weeks (6.4 min at 1x). **Code pending:** every per-month number re-bases. The in-game year count need not match Kairosoft.
- Act 1 keeps its current length (about 52 min of wall time) for now.
- The credits move from Lurah 3★ to Sidang Emas 2045.
- RT 3★ target is 12 min (section 3 target 4 said 10; section 2 said 12).

## Why

- Hari wants agents to run playtest, polish and design review, and needed a baseline for "good and repeatable".
- An 8s month gives about 440 in-game years in 8h, so yearly beats repeat every minute. Days were too fast for Indonesian life ("nothing happens in days"); weeks fit.
- Until the code lands, the doc states the decision and marks it pending, so no agent reads it as live behaviour.
