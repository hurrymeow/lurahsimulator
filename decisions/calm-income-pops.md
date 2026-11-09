# Calm the floating income pops

Plan: [`docs/plans/calm-income-pops.md`](../docs/plans/calm-income-pops.md).

## Decisions and why

- **Money pops show earnings only (Hari, option A).** A building whose net money for the tick is zero or negative gets no money pop. Upkeep and losses stay off the map. The money chip and the monthly report carry the totals. Why: about half the wall was red minus numbers, and Kairosoft shows costs in the report, not over each shop.
- **No black box behind pops (Hari).** Each number gets a 2px dark outline instead. Why: the box is what turns many pops into a solid wall. Outlined text covers far less map and stays readable on grass and roofs.
- **Unchanged:** non-money pops (hearts and others) keep both signs. The cost pop on placement stays. Job and level-up pops stay.
- **Not doing now:** a cap on pops on screen, round-robin, skip-instead-of-stack, zoom-aware labels, a monthly net delta on the money chip. Revisit after Hari plays with T1 and T2 live.
