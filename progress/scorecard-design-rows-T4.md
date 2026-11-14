# T4: thin stars give a Rupiah grant — shipped

Added `reward: { rupiah: ... }` to RW 3★ (Rp 5 juta), Kelurahan 2★ (Rp 10 juta), Kelurahan 3★ (Rp 15 juta) and all three Kecamatan stars (Rp 20 juta) in `src/data/higher/stages.ts`. The existing star engine already pays any `reward` key through `gain`, so no engine change was needed. `npm run typecheck` and `npm test` pass.
