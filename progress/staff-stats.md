# Staff stats: obvious and decisive

- `src/data/staff.ts`: `STAT_ICON`; every role has a `risk` stat and a `mishap`; `RISK`, `COURSE_COST`, `LEVEL_STAT_GAIN`. The Tukang Tagih's and Bendahara's hidden Jujur penalties are gone.
- `src/sim/staff.ts`: `mishapChance` and weekly mishaps that name the person and stat; `roleGain` (what one person adds); Bimtek takes a stat; level-ups raise the work stat; `grupWaShift`.
- `src/data/eventsStaff.ts`, `src/sim/events.ts`, `src/app.ts`: "who do you send?" choices (`send`), four new events and a third Tim Audit choice; the card lists the best three with their odds.
- `src/ui/staff.ts`, `src/style.css`: stat rows with icons, work and risk effects, greyed unused stats; the card's work line; applicants' "as this role" line; Bimtek courses; trait chips; the Grup WA odds line.
- `src/render/stat-art.ts`: the four stat icons.
- Strings in en and id (`staff.*`, `event.send*`, the new events in `events-id.ts` and `higher-id.ts`).
- Tests: `tests/staff-stats.test.ts`; `tests/higher.test.ts` now expects outcome texts.
- Details: `decisions/staff-stats.md`.
