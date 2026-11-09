# Playtest bot gaps T2

In `decide`, the "own N and the star still waits" fallback now checks the cards for another named building that is locked and owned 0 and, if there is one, returns `wait` with `saving for: <names>` instead of building another copy. Added a unit test in `tests/screen-bot.test.ts` for the locked and unlocked Kantor RT cases. `npm run typecheck`, `npm test` and the screen-bot spec pass.
