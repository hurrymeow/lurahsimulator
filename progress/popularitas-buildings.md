# Popularitas buildings: Praktik Bidan, Panggung Senam, Kolam Pancing

- `src/data/shops.ts`: three facilities, unlocked at RT 1★, 2★ and 3★.
- `src/render/art-content.ts`: `bidan`, `panggungSenam`, `kolamPancing` sprites.
- `src/render/map.ts`: Kolam Pancing is flat for ambient occlusion. It still needs a road, because it earns.
- `src/i18n/id-content.ts`: names and blurbs in Indonesian.
- Tests: `tests/content-shops.test.ts` checks one new Popularitas building per RT star and their trade-offs. Unit, economy, balance and bot tests pass. Build e2e specs pass in ID and EN at 320px, except "Place and Cancel sit right under the chosen tile", which fails the same way on main on this machine.
- Follows the docs.
