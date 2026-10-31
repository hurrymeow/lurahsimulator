# Pinjol and judol (slice task 2)

- Households are groups of three residents in move-in order (`householdGroups`). A group is in debt when any member has `debt`, and on judol when any member has `judol`. Saved on `Resident`, so no migration.
- Eligible to borrow: the group has someone idle 24+ weeks, or sits past the fed count (the last groups go hungry first). 3% a week, 2x on judol.
- A household in debt counts half unfed in `fed()`. The borrowing check uses `fedBase()` so debt does not feed itself.
- Debt collector: at 24 weeks in debt, one notice and Aman −5 for 12 weeks. The cut is global, since the player has one Aman. The plan said "that RT's Aman".
- Judol: each 10 Viral above 20 adds 1% a week to start. Income cut is 30% of the judol share of households, applied to shop income in `incomeMult`.
- Added, not in the plan: debt is repaid at 2% a week while the household is neither hungry nor idle, and judol quits at 2% a week. Without them the meters only rise and the 1★ goal (pinjol under 25%) cannot be met. Tune with the bots.
- The gate is `pinjolOn`: stage `kecamatan` with `kec` present. RT, RW and Kelurahan saves read no random numbers here.
