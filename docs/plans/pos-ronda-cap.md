# Cap Pos Ronda

## Goal
Stop a wall of Pos Ronda being the cheapest Popularitas, so players use Praktik Bidan, Panggung Senam and Kolam Pancing. Source: TODO.md "Cap Pos Ronda so players use the other Popularitas buildings". This task is also the Sonnet-tier trial of the DeepSeek executor (Hari, 2026-11-01).

## Decisions
- One flat `maxCount: 8` on Pos Ronda. `maxCount` is per building definition, not per stage, so the TODO's per-stage idea (4, 8, 12) needs a new mechanism and is out of scope. 8 is above what the RT bots use today, so only the Kelurahan bot should feel it.
- If the Kelurahan bot cannot reach its stars with the cap, the executor must stop with the question, not loosen the bot.

## Tasks

### T1. Flat cap on Pos Ronda (Sonnet, executor trial)
- Files: `src/data/buildings.ts`, `tests/kel-bot-lib.ts`
- Exact changes: add `maxCount: 8,` to the `posRonda` building in `src/data/buildings.ts`. In `tests/kel-bot-lib.ts`, make the bot respect the cap: it must never try a Pos Ronda once 8 stand (use the existing placement rule check, `ignoreLimit` stays false), and fall back to the other Popularitas buildings in its `SABAR` list. Change nothing else.
- Done when: `npm run typecheck` and `npm test` pass, including `tests/kel-bot.test.ts` with all three seeds reaching their stars; no map in any bot run holds more than 8 Pos Ronda; `decisions/pos-ronda-cap-T1.md` (why 8, what the bot does when capped) and `progress/pos-ronda-cap-T1.md` exist.
- Don't touch: other buildings, `src/sim/`, seeds, balance numbers, other tests, TODO.md. No e2e needed. If the bot cannot reach its stars with the cap, set status `stopped` with the numbers; do not raise the cap or edit goals.
