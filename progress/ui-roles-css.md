# Control roles in CSS and UI.md rule 14 (T1 of docs/plans/ui-hierarchy.md)

- Added UI.md rule 14, "Four roles, four looks". The CSS classes are the source of truth.
- Selected tabs, the pause toggle, `[aria-pressed]` buttons and toggles now use the choice look: accent border and underline, no fill. Only `.btn-primary` uses the accent fill.
- Job and Lomba pickers use `.btn-choice` instead of `.btn-primary`.
- Disabled buttons keep a solid border. A disabled primary stays filled in a muted grey with white text (7.9:1).
- Not done here: Pak/Bu on the setup screen still uses `.btn-primary` (T3).
