# Smaller map T2: absorbing an RT

Added `absorbed?: boolean` to `Neighbour`, extracted takeover's join steps into `joinPlayer`, and exported `absorb`, which joins an AI RT for free and marks it absorbed; `handBack` now returns at once for an absorbed RT. `sameTraitNeighbours` counts AI-run RTs only, and `mutasiTargets`/`checkMutasi` skip absorbed RTs. `tests/grow.test.ts` covers the free join, Dana refund, building and warga transfer, kept stars, absorbing an already player-run RT, and the no-op hand-back. Typecheck and unit tests pass; no e2e is needed and nothing calls `absorb` yet.
