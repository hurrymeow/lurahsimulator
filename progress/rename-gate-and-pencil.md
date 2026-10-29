# Rename gate, pencil icon, CI-only screenshots

Shipped in PR #142 (merge e8f0321).

- **Rename gate.** `RENAMABLE` in `src/data/brands.ts` lists the shops and the building-like facilities that may be renamed. Pos Satpam, Lapangan, ponds, posts, decor, Bank Sampah, Portal, the tukang parkir and the gudang material cannot be renamed. `tests/content-brands.test.ts` checks the list.
- **Pencil icon.** The inspector shows a pencil beside the name. Only the pencil opens the rename field and keyboard. It reuses the scroll icon, so no new art.
- **CI-only screenshots.** `tests/e2e/visual.spec.ts` skips unless `CI` is set. CI still runs it on every PR.
