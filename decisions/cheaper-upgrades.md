# Half-price upgrades

- An upgrade to level n+1 costs base price × 0.5 × n. It used to cost base price × n, so a warung L2 (Rp 1.5M for +Rp 150rb a month) paid back in 10 months while a second warung (Rp 1.5M for Rp 250rb) paid back in 6. Upgrading was never the right move, which is what "very slow to upgrade" was.
- At half price the payback is 5 months, so a level is worth buying and it competes with a second building. A new building still wins on one thing: it adds `attract`, so it still pulls residents in. That keeps the two choices distinct instead of making upgrades strictly better.
- `LEVEL_BONUS` stays at 0.6. Only the price moved, so the income curve, the autoplayer and every star threshold keep their meaning.
- The number lives in `balance.ts` as `UPGRADE_COST_PER_LEVEL` so it is tuned in one place.
- The balance autoplayer barely notices: it upgrades once it holds Rp 12M, by which point price is not the constraint. This change is for the human mid-game, so the test asserts the price rule rather than a bot outcome.
