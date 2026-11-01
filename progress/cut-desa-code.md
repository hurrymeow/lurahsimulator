# Desa path cut from the code

- The RW SK offers the Kelurahan only. `sk-accept-desa` and `stage.acceptDesa` are gone.
- Desa buildings, sprites, combos, job, titles and strings removed. `git grep -i desa src` finds only the save check and the BUMDes sentence in the old event text.
- A save with `stage.path: 'desa'` loads as null. Unit test in `tests/save-compat.test.ts`.
- Tests that played the Desa path are removed or rewritten. The e2e spec is now "the RW SK offers the Kelurahan".
- Details: `decisions/cut-desa-code.md`.
