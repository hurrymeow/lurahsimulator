# Event choices are secondary

## Goal
UI.md rule 14: a choice between alternatives has no primary fill. Today event choices 2 and up, and every Send button, use `btn-primary`. Source: `docs/plans/ui-audit-fixes.md` T9 (event half), decision 1; TODO.md "Events with no primary choice". Hari approved running the audit plan through the executor (2026-11-01).

## Decisions
- All event choice buttons use plain `btn`. The result pop-up's single button stays primary and is not in `showEvent`.
- The Combo half of T9 (remove `data-clamp` in `src/ui/lists.ts`, shorten effects) is a separate task: it needs the effect strings found and a 320px ID check, so it is not in this one.

## Tasks

### T1. Event choice buttons are secondary (Haiku)
- Files: `src/app.ts`
- Exact changes: in `showEvent` in `src/app.ts` make two class changes and nothing else. (1) The choice button `class: `btn ${i === 0 ? '' : 'btn-primary'}`` becomes `class: 'btn'`. (2) The send button `class: 'btn btn-primary send-btn'` becomes `class: 'btn send-btn'`.
- Done when: `npm run typecheck` and `npm test` pass; `git diff` shows exactly two changed lines in `src/app.ts`; `grep -n "btn-primary" src/app.ts` shows none inside `showEvent`; `decisions/events-secondary-choices-T1.md` and `progress/events-secondary-choices-T1.md` exist.
- Don't touch: event outcomes, the result button, strings, CSS, tests. No refactors. No e2e needed; CI runs the full suite.
