# Jalan Setapak lives in Decor only

- **Supersedes the pin in `decisions/selokan-back.md`.** Jalan Setapak no longer leads the opening Build tab. It appears only on the Decor tab, where it already lived (`paths` folds into `decoration` in `src/data/categories.ts`), and leads that tab.
- **Why:** Hari asked for it. The first tab should show real buildings, and the path is one tap away on Decor.
- **Tutorial:** The paced first build never asks for a path. It points at Housing and Rumah, and says "close to the road" on the starting loop. No tutorial step changes.
- **Trade:** A new player who looks for a path must open Decor. The no-road hint (`insp.noRoad`) still names Jalan Setapak.
