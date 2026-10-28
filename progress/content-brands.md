# Content trim, problem unlocks, brands

- `src/data/shops.ts`, `decor.ts`, `farm.ts`, `buildings.ts`, `stages.ts`: Rumah Makan; retired buildings; renamed Warung Sembako, IndoApril, BetaMart, Balai-balai Bambu, Lampu Jalan; re-gated unlocks; new decor effects.
- `src/data/brands.ts`, `src/sim/brands.ts`: brand lists, local names, franchise, Kanibal, rename, change brand.
- `src/sim/problems.ts`: problem tracking and idle months; `Requirement.problem` and `Requirement.stage` in `src/sim/rules.ts`; problem unlock notices in `checkUnlocks`.
- `src/sim/combos.ts`: level needs (`id@level`), legacy buildings, different-brand combos, retired combos; `perangKuota` in `combos-more.ts`.
- `src/render/art-content.ts`: levelled `rumahMakan` art.
- `src/ui/inspect.ts`: name and brand rows, franchise and Kanibal lines, rename form.
- `src/sim/events.ts`: one-off scheduled events count in `crowded()`.
- Tests: `tests/content-brands.test.ts` (brands, franchise, Kanibal, Perang Kuota, problem unlocks, menu size); updated combo, footprint, engine, nextstep and sim tests; balance bot tweaks; e2e for the brand and rename inspector.
