# Two-row top bar, three-button dock, broken paths

- `src/ui/console.ts`: time row (`#cs-row1`) and money row (`#cs-row2`); the goal as a pill on the map; the month line; the Build / Warga / Menu dock with icons.
- `ActionButton.dock` keeps docked panels out of the Menu (`src/ui/menu.ts`). The opener points at `#dock-build` (`src/ui/coach.ts`).
- `src/render/map.ts`: broken paths greyed with cracks across the tile, a pulsing red tint, an orange outline and an orange badge.
- E2E: an `openPanel` helper opens Build and Warga from the dock; the frame test checks the two rows, equal play/speed, the goal pill, an equal dock and Build/Warga missing from the Menu; the light/dark box test covers the new parts; the legibility scan allows 28px in the top rows and the goal pill.
- Screenshot baselines redrawn in CI.
- Baselines redrawn in CI's Playwright image (commit 60c36d2): HUD, Build sheet, event popup and tip card, in English and Indonesian. Before: `main`'s `tests/e2e/visual.spec.ts-snapshots/`; after: the same paths at 60c36d2. The home baseline hides the map, so it did not change. Commits pushed by the Update baselines workflow start no CI run, so a commit of our own must follow them.
