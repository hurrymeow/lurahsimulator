# Blurb length test

Added `tests/blurb-length.test.ts`, a unit test for UI.md rule 8 across every building def in the RT data files and `src/data/higher/`, checked in both languages through `bBlurb`. `npm run typecheck` passes. `npm test` reports 504 passing and only the new test failing: `parkir` (English) 26 words and `terminal` (English) 28 words; Indonesian is clean. Work stopped pending a decision on those two blurbs; no strings or other tests were changed.
