# Local e2e scope for AI contributors

**Decision (Hari, 2026-10-28):** agents stop running the full `npm run e2e` (about 880 tests) before a push.

**Now:** run `npm run typecheck`, `npm test`, and only the e2e specs the change touches. CI runs the full sharded suite in Indonesian on every PR. English is local-only, so a change to English UI text or layout runs the touched specs with `--project=phone-<width>-en`.

**Changed docs:** AGENTS.md, CLAUDE.md, CONTRIBUTING.md, ART.md.
**Why:** the full local run cost the most time and tokens, and CI already covers the full suite in Indonesian.
