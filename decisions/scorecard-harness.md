# Scorecard harness

- **Unknown is a real verdict.** A row is Unknown when the harness cannot judge it, and says why. It is never Pass for a sub-check that did not run. Rows with a measured part and an unmeasured part read Fail if the measured part fails, else Unknown.
- **Bot definitions.** Idle only answers events. Builder buys a plain order (combo pieces, then draw per price, decor last), keeps beds ahead, reads the Buku Combo and mends. Shopkeeper puts income buildings first. Safety-first buys one Pos Satpam, lamps and a Bidan early and pays for event fixes. Cheapskate acts every fourth week and keeps a large buffer. Pencitraan announces a Wacana every fourth week and skips the needs buildings. Honest builds the needs buildings first and never announces. Random placer drops random buildings on random free tiles. Hint reader builds only the combo the game names (`nextStep` and `easiestCombo`). Builder, Shopkeeper, Safety-first, Cheapskate, Pencitraan and Honest read the Buku Combo from week 30, when the game starts to hint (`COMBO_HINT_MONTH`), so early money goes to growth.
- **Proxies.** Item 1 uses "cheapest next building costs more than cash" in place of a goal ETA. Item 6 checks that a cause is logged, not that it is shown. Item 11 ends its depth check at the last new unlock, combo or stage.
- **Runs end** when a bot has all nine stars or after 450 ticks (60 min at 1x).
- **Nightly, not per PR.** About 10 min of CPU on four cores. Heavy checks stay out of PR CI (CLAUDE.md).

## Nightly split (2026-10-31)

- The first manual nightly run hit the 20 min cap in all three bot groups. A bot that stalls late plays 450 ticks on the big Kelurahan map and takes several minutes a seed.
- The workflow now runs one bot on two seeds per job (9 bots x 5 seed pairs, 30 min cap each) plus one takeover job. Chunks write `<bot>-<first seed>.json`; the report job merges them. `npm run scorecard` still plays everything in one go and is only practical on a fast machine (over 2 hours in a 4 core sandbox).
