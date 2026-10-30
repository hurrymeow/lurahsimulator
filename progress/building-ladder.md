# Building ladder, second pass

- `src/data/shops.ts`, `src/data/farm.ts`, `src/data/buildings.ts`, `src/data/higher/rw.ts`: Barbershop, Kandang Ayam, Bank Sampah, Kontrakan (now 2x2, 12 beds), Kolam Lele, Posyandu and Portal moved up to their tier.
- `src/i18n/id-content.ts`: the Bank Sampah blurb's numbers.
- `src/sim/save.ts`, `src/sim/types.ts`, `src/sim/state.ts`: `growBuildings` takes its table; a `laddered` pass fits old 1x1 Kontrakan.
- Tests: `tests/shapes.test.ts` covers the Kontrakan migration; `tests/content-shops.test.ts` expects 12 beds. Balance, RW and Kelurahan bots pass.
- The full table is in `decisions/building-ladder.md`.
- Follows the docs.
