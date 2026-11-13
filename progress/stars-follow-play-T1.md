# T1: rival chases the player

Added `RIVAL_TRACK = 0.9` in `src/data/ranking.ts` and applied it in `yearlyRanking` (non-RT stages): the rival's score is raised to at least 90% of the player's latest score in the same stage, if any. Added `tests/ranking-track.test.ts` covering the RW floor, the RT no-op and the no-previous-entry no-op. Tuning the share and its interaction with goals and pacing is T2. `npm run typecheck` and `npm test` pass.
