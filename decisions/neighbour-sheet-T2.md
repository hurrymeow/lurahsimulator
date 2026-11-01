# Neighbours sheet as a list, then a detail per RT

Plan: `docs/plans/neighbour-sheet.md` T2.

- The sheet opens on a list: one row per RT with name, stars, the one blocking goal and one chip (Stalled, Building, Max, Yours). Stalled rows sort first.
- "Auto-fund all" cycles Off, 3, 6, 12 for the AI-run RTs only. RTs the player runs are left alone.
- The detail holds unmet goals, Dana ×6 as the one filled button, Dana ×1, one Auto chip, and Ambil alih or Serahkan. Rules sit behind "?" in the head.
- Removed: the per-RT ranking line and its keys (`grow.rank`, `grow.rankParts`), and the boost badge. The boost text stays in the help view.
- The `'neighbours'` entry is deleted from the density allowlist.
