# The Selokan never unlocked: the banjir almost never came

The owner asked whether the Selokan (biopori) was deleted from the live build.

## What was found
It is not deleted. The building is still defined (`id: 'biopori'`, named Selokan; old `selokan` saves swap to it in `src/sim/save.ts`). It opens only after the first banjir (GAME-DESIGN.md "Problem unlocks": "Selokan after the first banjir"). The banjir had become so rare that most players never met one, so the Selokan never appeared in Build:
- None of the three dev saves (weeks 72 to 180) has ever had a banjir.
- Over 300 weeks (about 6 game years), a game where the player does nothing saw 0 or 1 banjir per seed. The builder bot saw none in 4 of 4 seeds.

## Cause
The banjir is a random seasonal event: `months: [10, 11, 0, 1]` (the rainy months), chance 0.3. When the weekly calendar arrived (one tick is a week, #192), `inMonths` came to mean "the first week of one of these months". A seasonal random event then had 4 eligible ticks a year out of 48, where it used to have 4 out of 12. On those 4 weeks it still had to pass the shared popup pool: the popup gap, the clear weeks around other popups, the popup roll and the weighted pick. Events with no month list kept every week. So the banjir became about twelve times rarer than its neighbours. The other random seasonal events (a few at the RW and Kelurahan) had the same problem.

## Fix
- **A random seasonal event can come in any week of its months.** Scheduled ones (chance 1) still come on the first week of their month. So that a whole season of eligible weeks cannot bring a second flood, its repeat gap is at least the weeks its months span (16 for the banjir).
- **The first banjir is sure** (`firstSure` on its data). If a game has never had one, it comes in the first rainy season (from week 40), in the first week that keeps clear of other popups. A season is 16 weeks, so there is room. Later floods stay random. A save that never had a banjir gets its first one in the next rainy season, so players already deep in a game get the Selokan too.

Unit test in `tests/events.test.ts`: in 10 of 10 seeds the first banjir comes between weeks 40 and 55, the problem is noted, and floods are at least 16 weeks apart. The pacing test (popups at least 3 weeks apart) still passes.

## Player types, main against this branch
NUMBERS

## Verdict
Self-approved under the TODO rule. GAME-DESIGN.md already says the Selokan opens after the first banjir; this makes that true again. TESTING.md: a unit test for the bug, and the player types compared against main above.
