# Executor Sonnet batch T2: dense housing numbers

Shipped the data change (Rumah 3/4/5, Kos-kosan 10/14, Kontrakan 24/32) and the two named test updates. `npm run typecheck` passes; `npm test` gives 502 passed and one failure, `tests/stages.test.ts > late-RT content > Kos-kosan houses 8` (expected 14, received 16), which is outside the tests the task allows editing. Not merged; awaiting a decision on that test and on the hard-coded `[3, 5, 7]` in `tests/e2e/ui.spec.ts`.
