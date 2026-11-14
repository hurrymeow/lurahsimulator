# T14 progress

- `src/sim/nextstep.ts`: `easiestCombo` names only a combo whose missing pieces have a legal, path-fed site in reach. Test in `tests/nextstep.test.ts`.
- Driver change dropped in review (it slowed the shopkeeper). Times with the shipped change only, seeds 1/2/3, RT 1★ / 2★ / 3★ in minutes: shopkeeper 7.3/9.7/11.2, 4.7/10.4/12.0, 4.7/11.5/12.3; builder and safety unchanged from main.
- `npm run typecheck` and `npm test` pass (693 tests).
