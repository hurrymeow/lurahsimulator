# Developer test seeds

- Settings has a "Developer" row with three buttons: RT 3★, RW 3★, Kelurahan. Each loads a ready-made save from `src/sim/seeds/*.json` (lazy chunks, not in the main bundle).
- It is visible in the public build on purpose: Hari tests on the live site on his phone. Players who tap by mistake are protected by a two-tap confirm, because the seed replaces the current save.
- Seeds come from a plain bot (`tests/seed-bot.ts`): builds everything placeable, upgrades, mends, funds every RT. Rebuild with `SEED_WRITE=1 npx vitest run tests/seed.test.ts`. Do this after a save-format or content change that breaks loading; old seeds also migrate through `deserialize`.
- Contents: **rt3** is the RT at 3★ with about 128 buildings. **rw** is RW at 3★ with about 200 buildings and 4 RTs on Auto-dana. **kel** is Kelurahan stage (0★) with RT 3★, RW 3★, a built Kelurahan and ~45M rupiah.
