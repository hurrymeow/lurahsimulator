# Staff system

- `src/data/staff.ts`: roles, slots, star totals and salaries, channels, requirement lines, traits, specials, levels, Bimtek, mutasi, role effects, Inem and her gigs.
- `src/sim/staff.ts`: Inem on every game and save, slots, posting and rolling applicants, hiring (Grup WA hires a warga), raises, poaching, Bimtek, firing, mutasi, monthly wages and role effects, Healing Mulu after events, gigs.
- Hooks: permits and crews in `advanceConstruction`, upkeep in `buildingUpkeep`, Aman and Kerja in `src/sim/needs.ts`, staff skip auto-jobs and idleness.
- `src/ui/staff.ts`: the Staff panel (Menu > Kampung): staff cards with stat bars, raise answers, Bimtek, mutasi and letting go; the Lowongan; Inem's dream.
- Tests: `tests/staff.test.ts`; i18n covers every staff data string; e2e for the Staff panel at every width and language.
