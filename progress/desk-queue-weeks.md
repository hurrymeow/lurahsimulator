# Desk queue after the weekly calendar

- `src/data/staff.ts`: `hireAfter` is 12 weeks; the desk numbers are per week.
- `src/sim/tick.ts`: the permit queue costs Popularitas as a whole (1 a week, 2 when 12 weeks deep), not per waiting building.
- Strings in en and id: the queue, the hire step and the status line say weeks.
- `src/data/higher/stages.ts`, `GAME-DESIGN.md`: Kelurahan 3★ needs Popularitas 35; the doc's 2★ and 3★ numbers match the code.
- Tests: `tests/kel-bot.test.ts` hires an Asisten when the queue is deep, stops buying while it is, and asks for 3★ on two seeds of three; `tests/desk.test.ts` uses a 15-week queue for the hire step.
- Why: `decisions/desk-queue-weeks.md`.
