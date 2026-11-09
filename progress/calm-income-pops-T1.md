Money pops now show earnings only. In `handleFx` (`src/app.ts`), a rupiah pop is drawn only when its net amount for the tick is at least 1; upkeep and losses are no longer drawn over the map and stay in the money chip and the report. Non-money pops keep both signs, and the placement cost pop is unchanged. UI.md checklist item 12's "Good here" and "Pass" lines now describe this rule, recorded in `decisions/calm-income-pops.md`.

Review: diff read in full and matches the plan's exact changes. Nothing outside Files touched.
