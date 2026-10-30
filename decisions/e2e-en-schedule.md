# English e2e on a schedule

A weekly workflow (`.github/workflows/e2e-en.yml`, Sundays 20:00 UTC, also runnable by hand) runs the full sharded e2e in English at the four phone widths. PR CI stays Indonesian only. `playwright.config.ts` reads `E2E_LANG=en` to pick the English projects in CI. Failures show as a red run in Actions; nobody is notified. Follows the docs. Source: `decisions/default-lang-id.md`.
