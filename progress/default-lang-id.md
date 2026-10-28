# Indonesian by default, CI in Indonesian

- `DEFAULT_LANG` is `id`, and `index.html` starts with `lang="id"`.
- `playwright.config.ts` builds only `-id` projects when `CI` is set. Local runs keep `-id` and `-en`.
- The language e2e test checks the Indonesian default and a switch to English. Visual baselines and the Update baselines workflow are Indonesian only.
- `index.html` fallback text and aria labels, the meta and manifest descriptions, and `mockup.html` are Indonesian. The manifest sets `"lang": "id"`.
- Added `TODO.md` with the open tasks and ideas found in GAME-DESIGN.md, `progress/` and `decisions/`.
