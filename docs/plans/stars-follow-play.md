# Stars follow play, not time in stage

## Goal
A builder that never hires reaches RW 3★ and Kel 3★ at least 15% later than a hiring one, and the RW lands inside its length band (about 20 min). Source: TODO.md "Stars still follow time in the stage". Evidence: `decisions/stage-lengths-quarterly-wins.md`, `decisions/wacana-staff-core-T6.md` (bar 5).

## Decisions
- From the RW on, the rival also chases the player. Each quarter it scores at least `RIVAL_TRACK` times the player's score the quarter before, on top of the existing formula. A player who grows fast keeps winning. A player who stalls or loses ground starts losing, so wins stop counting calendar time alone. The RT is unchanged.
- First value `RIVAL_TRACK = 0.9`. Tune by measurement (T2), not by feel.
- Staff and Sejahtera need no new rule: they raise score, so they widen the margin.
- Lost quarters already cost 5 Popularitas (`LOSE`), so the stall is self-limiting. The 16-quarter growth cap stays.

## Tasks

### T1. Rival chases the player (Sonnet, executor trial)
- Files: `src/data/ranking.ts`, `src/sim/ranking.ts`, `tests/ranking-track.test.ts` (new file)
- Exact changes: add `export const RIVAL_TRACK = 0.9;` to `src/data/ranking.ts`. In `yearlyRanking` in `src/sim/ranking.ts`, when `stage !== 'rt'`, find the latest entry in `s.ranking` with `tier === stage`. If one exists, `them = Math.max(them, Math.round(prev.us * RIVAL_TRACK))`. Create `tests/ranking-track.test.ts` with a test: in the RW, with a previous entry of `us: 1000`, the rival scores at least 900; at the RT the same entry changes nothing; with no previous entry in the stage nothing changes.
- Done when: `npm run typecheck` and `npm test` pass; `decisions/stars-follow-play-T1.md` and `progress/stars-follow-play-T1.md` exist and say what changed and that tuning is T2.
- Don't touch: other stages' constants, goals, bots, seeds, TODO.md, any file not listed. No e2e. If an existing test fails because of the new rule, stop with the test name and numbers; do not edit it.

### T2. Measure and tune (Sonnet thread, not the executor)
- Run the no-hire builder and the nine player types on main and on T1 through the Nightly. Raise or lower `RIVAL_TRACK` until the no-hire builder is 15% or more later at RW 3★ and Kel 3★, every climbing type still reaches Kel 3★, and the cheapskate is not stranded. Log numbers in `decisions/stars-follow-play.md`.

### T3. RW 1★ asks for more (Sonnet thread, after T2)
- Make RW 1★ ask for more than three builds in Kampung Sebelah. Check RW length against its band. Own decisions file.
