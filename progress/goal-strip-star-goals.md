# Goal strip: pending goals for the next star

- `src/sim/nextstep.ts`: `nextStep` returns `{ kind, text }`; no "reach N residents" fallback; `shortGoal` wraps it.
- `src/ui/goal.ts`: the line shows the unmet star goals' count and the first one; opened, one row per unmet goal and the next step.
- `src/ui/console.css`: `.goal-row`, `.goal-step`.
- `src/i18n/en.ts`, `src/i18n/id.ts`: `goal.left`, `goal.leftOne`, `goal.step`; steps lose the "Now:" / "Kini:" prefix; `goal.line` and `goal.short.pop` removed.
- Tests: `tests/nextstep.test.ts` updated; the opener e2e checks the opened rows carry have and need.
- Follows the docs.
