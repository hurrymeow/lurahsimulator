# Staffing prototype: the permit desk queue

- `src/sim/staff.ts`: `deskCapacity`, `permitQueue`, `permitEta`, `queueMonths` and `clearPermits`; Inem's permit bonus (`permitCut`) is gone.
- `src/sim/tick.ts`: permits wait for the desks instead of counting down on their own; stamped buildings go on site.
- `src/data/staff.ts`: the Asisten role can be posted from RT 1★; `ROLE_FX.asisten` holds the desk numbers.
- `src/sim/nextstep.ts`, `src/ui/goal.ts`: a `desk` step leads the goal strip once the queue is 3 months deep and a slot is free.
- `src/ui/inspect.ts`, `src/render/map.ts`: the permit's place in the queue and months to go, and a pile of folders on the Kantor RT.
- Strings in en and id; `GAME-DESIGN.md` staff lines.
- Tests: `tests/desk.test.ts` (order, more desks, the floor, going on site, the goal strip step). The full unit suite and `ui.spec.ts` at 320-id, 412-id and 412-en pass, apart from the known "Place and Cancel sit right under the chosen tile".
- Numbers and open questions: `decisions/desk-queue.md`.
