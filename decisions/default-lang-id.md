# Indonesian by default, and CI in Indonesian only

- The game now opens in Bahasa Indonesia. English stays a Settings option. A player who saved a language keeps it, and `?lang=` still overrides it for one visit.
- CI runs the e2e suite in Indonesian only, at 320, 360, 412 and 430px. Indonesian is the default and its longer strings clip first, so it is the stress case (UI.md rule 5).
- English still runs locally: `npm run e2e` covers both languages. Run it before you push a change to English text or layout. UI.md rule 5 still applies to English, and it is now checked by hand, not by CI.
- Screenshot baselines are Indonesian only. They can only be drawn in CI's Playwright image, so English ones would go stale. The English PNGs are removed.
- The language test now checks the Indonesian default and a live switch to English, so it still runs in CI.
- Docs changed: AGENTS.md, CLAUDE.md, CONTRIBUTING.md (Language, Workflow 5), GAME-DESIGN.md (UI rules), UI.md (checks table).
- Every other default follows: the static text and aria labels in `index.html` (shown before the script runs), the page and web app manifest description (the manifest now sets `"lang": "id"`), and the dev mockup page (`?lang=en` for English).

## TODO.md

- New `TODO.md` at the root lists open tasks and ideas. Agents pick work from it and remove the item in the PR that starts it, so two PRs do not take the same task. AGENTS.md, CLAUDE.md and CONTRIBUTING.md (Workflow 1) say so.
- It is one shared file, unlike `decisions/` and `progress/`. Two PRs that each remove a different line merge cleanly. A conflict there is resolved by keeping both removals.
