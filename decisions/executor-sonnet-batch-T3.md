# Blurb length test

Added `tests/blurb-length.test.ts`. It walks `allDefs()` and resolves each building's blurb with `bBlurb` after `setLang`, the same lookup the Build grid and the inspector use, then asserts 25 or fewer whitespace-separated words in English and Indonesian (UI.md rule 8). This covers `src/data/buildings.ts`, `shops.ts`, `decor.ts`, `farm.ts` and `src/data/higher/`; no `facilities.ts` exists. No strings changed. The test exposes two existing English overruns, `parkir` (26) and `terminal` (28), and is left failing so the list stays visible.
