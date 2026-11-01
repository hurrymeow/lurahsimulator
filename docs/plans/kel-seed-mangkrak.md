# Clean the Kelurahan dev seed

## Goal
Hari loaded the Kelurahan dev seed (Settings, Developer) and saw stalled "80%" projects. The seed file holds four `mangkrak` buildings (uids 3508, 3509, 3869, 4080) left by the seed bot, which drain Popularitas from the first minute. A dev seed must start with none. Source: Hari's screenshot, 2026-11-01.

## Decisions
- Fix the data, not the game: the seed JSON is edited directly (same shape as an active building, so a plain status swap is safe).
- No road errors reproduce on main: all three seeds load with zero `noRoad` after a load, 6000 ticks, and promotion from rt3 and rw. The existing seed test already guards that. A stale save from an older seed build in the browser is the likely cause of Hari's "Tanpa jalan"; loading the seed again replaces it.

## Tasks

### T1. Make the Kelurahan seed start with no stalled project (Haiku)
- Files: `src/sim/seeds/kel.json`, `tests/seed.test.ts`
- Exact changes:
  - `src/sim/seeds/kel.json` is one line. Replace every `"status":"mangkrak"` with `"status":"active"` (exactly 4 occurrences). Use `sed -i 's/"status":"mangkrak"/"status":"active"/g' src/sim/seeds/kel.json`. Change nothing else in the file.
  - `tests/seed.test.ts`, in the test whose title starts `${id} is a planned town`, add one line after the `noRoad` expectation: `expect(s.buildings.filter((b) => b.status === 'mangkrak').map((b) => b.def)).toEqual([]);`
- Done when: `npx vitest run tests/seed.test.ts` passes, with the new line failing on the old seed and passing now; `npm run typecheck` passes; `progress/kel-seed-mangkrak-T1.md` exists with one line.
- Don't touch: other seed files, `tests/seed-bot.ts`, `src/`, TODO.md. No e2e needed.
