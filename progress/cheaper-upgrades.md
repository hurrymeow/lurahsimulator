# Cheaper upgrades

- Upgrades cost base price × 0.5 × level, down from × 1 × level. Warung L2 is Rp 750k, L3 Rp 1.5M; Indomaret L2 Rp 3.5M.
- `UPGRADE_COST_PER_LEVEL` in `balance.ts` holds the number.
- New unit test: an upgrade costs less than a second building at level 1, and about one building at level 2.
