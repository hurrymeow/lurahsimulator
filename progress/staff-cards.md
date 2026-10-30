# Staff page with one main action per card

- `src/ui/staff.ts`: `openStaff(app, view)` with list, person and post views; compact cards with one main button; rare actions in the person view; channels in the post view.
- `src/style.css`: `.staff-open`, `.staff-detail`, `.staff-channel`.
- `src/i18n/en.ts`, `src/i18n/id.ts`: `staff.back`, `staff.details`, `staff.pickChannel`, `staff.postRole`.
- Tests: the two lowongan e2e specs go through the channel view; a new e2e covers hire, one main button per card, the raise from the card and Let go from the detail view, legible at 320px in ID and EN.
- Follows the docs.
