# Executor dry run

## Goal
T4 of `deepseek-executor.md`: one copy-only task to prove the DeepSeek executor end to end. Not a game change worth debating.

## Tasks

### T1. Settings music help wording (Haiku)
- Files: `src/i18n/en.ts`
- Exact changes: in `src/i18n/en.ts` change the value of `'set.musicHelp'` from `'Background tune. 0 turns it off.'` to `'Background music. 0 turns it off.'`. Change nothing else.
- Done when: `npm run typecheck` and `npm test` pass; `git diff` shows exactly one changed line in `src/i18n/en.ts`; `decisions/executor-dry-run-T1.md` and `progress/executor-dry-run-T1.md` exist.
- Don't touch: `src/i18n/id.ts` (already says "Musik"), any other string, tests, TODO.md. No refactors. No e2e needed: no spec reads this string.
