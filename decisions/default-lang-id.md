# Indonesian by default, and CI in Indonesian only

- The game now opens in Bahasa Indonesia. English stays a Settings option. A player who saved a language keeps it, and `?lang=` still overrides it for one visit.
- CI runs the e2e suite in Indonesian only, at 320, 360, 412 and 430px. Indonesian is the default and its longer strings clip first, so it is the stress case (UI.md rule 5).
- English still runs locally: `npm run e2e` covers both languages. Run it before you push a change to English text or layout. UI.md rule 5 still applies to English, and it is now checked by hand, not by CI.
- Screenshot baselines are Indonesian only. They can only be drawn in CI's Playwright image, so English ones would go stale. The English PNGs are removed.
- The language test now checks the Indonesian default and a live switch to English, so it still runs in CI.
- Docs changed: AGENTS.md, CLAUDE.md, CONTRIBUTING.md (Language, Workflow 5), GAME-DESIGN.md (UI rules), UI.md (checks table).
