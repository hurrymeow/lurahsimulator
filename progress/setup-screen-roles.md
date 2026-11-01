# Setup screen roles (T3 of docs/plans/ui-hierarchy.md)

- The title is a plain pixel heading, not a box.
- Pak/Bu is a choice segment (`.btn-choice`). Mulai is the only filled button.
- The dice are 48px icon buttons with a new 16px pixel dice in `src/render/stat-art.ts` (aria-label "Acak"/"Random").
- The "Kampung" prefix beside the field is gone. The saved name still starts with "Kampung".
- Kembali is a secondary button at its own width.
- `.name-input` is now a cream field with an inset border, so inputs differ from buttons (rule 14).
