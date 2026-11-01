# Trim two blurbs over 25 words

## Goal
Two English blurbs run over the 25-word rule (Hari, 2026-10-27), found by the executor's blurb-length test (PR #245): `parkir` 26 words and `terminal` 28. Trim them so the test can land. Source: `docs/plans/executor-sonnet-batch.md` T3.

## Tasks

### T1. Trim the parkir blurb (Haiku)
- Files: `src/data/buildings.ts`
- Exact changes: in `src/data/buildings.ts` change the `parkir` blurb from `'Turns up beside some new shops. Pays small retribusi to the kas, costs Popularitas. Tertibkan him with a Hansip or Orang Inside; he may come back.'` to `'Turns up beside new shops. Pays small retribusi to the kas, costs Popularitas. Tertibkan him with a Hansip or Orang Inside; he may come back.'`. Change nothing else.
- Done when: `npm run typecheck` and `npm test` pass; `git diff` shows one changed line in `src/data/buildings.ts`; `decisions/trim-two-blurbs-T1.md` and `progress/trim-two-blurbs-T1.md` exist.
- Don't touch: any other string, the Indonesian text, tests, TODO.md. No refactors. No e2e needed.

### T2. Trim the terminal blurb (Haiku)
- Files: `src/data/higher/kelurahan.ts`
- Exact changes: in `src/data/higher/kelurahan.ts` change the `terminal` blurb from `'The kelurahan landmark, 3x3. Income from every bus and ojol, and shops within 3 tiles earn 20% more from the crowd. -1 Popularitas a week for the horns.'` to `'The kelurahan landmark, 3x3. Income from every bus and ojol; shops within 3 tiles earn 20% more. -1 Popularitas a week for the horns.'`. Change nothing else.
- Done when: `npm run typecheck` and `npm test` pass; `git diff` shows one changed line in `src/data/higher/kelurahan.ts`; `decisions/trim-two-blurbs-T2.md` and `progress/trim-two-blurbs-T2.md` exist.
- Don't touch: any other string, the Indonesian text, tests, TODO.md. No refactors. No e2e needed.
