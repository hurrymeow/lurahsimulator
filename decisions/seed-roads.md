# Dev seeds: roads for real

Hari saw dozens of "Tanpa jalan" buildings after loading the Kelurahan seed. Cause: the test setup switches the road rule off (`tests/setup.ts`), so the seed test's "every building has a road" check passed without checking anything. The seed bot also built houses over its own Jalan Setapak streets (placing on a street replaces it), which cut the streets off the Kantor.

- The seed bot now plays with the road rule on and never builds over a street.
- The seed test switches the rule on for its check, so it fails if a seed has a cut-off building.
- All three seeds are regenerated (`SEED_WRITE=1 npx vitest run tests/seed.test.ts`). The Kelurahan seed also starts with no stalled project.
- `tests/pinjol.test.ts` "one member in three" now trims to whole households, because the new seed's resident count left a household of one.
