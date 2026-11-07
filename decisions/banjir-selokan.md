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
Median minutes at 1x to each star, with the seeds that reached it out of 6.

| Bot | RT3 main | RT3 here | RW1 main | RW1 here | RW2 main | RW2 here | RW3 main | RW3 here | Kel1 main | Kel1 here |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| builder | 13.4m (6/6) | 14.1m (5/6) | 14.2m (6/6) | 14.9m (5/6) | 19.2m (6/6) | 19.2m (5/6) | 21.2m (6/6) | 21.7m (5/6) | 27.9m (6/6) | 28.4m (5/6) |
| shopkeeper | 13.5m (6/6) | 13.4m (6/6) | 14.3m (6/6) | 14.2m (6/6) | 19.2m (6/6) | 19.2m (6/6) | 20.6m (6/6) | 21.4m (6/6) | 27.3m (6/6) | 28.1m (6/6) |
| safety | 13.7m (6/6) | 13.4m (6/6) | 14.5m (6/6) | 14.2m (6/6) | 19.2m (6/6) | 19.2m (6/6) | 21.5m (6/6) | 21.3m (6/6) | 28.2m (6/6) | 28.0m (6/6) |
| pencitraan | 13.7m (2/6) | 13.5m (2/6) | 14.5m (2/6) | 14.3m (2/6) | 19.2m (2/6) | 19.2m (2/6) | 21.3m (2/6) | 20.8m (2/6) | 28.0m (2/6) | 27.5m (2/6) |
| honest | 13.2m (6/6) | 14.5m (5/6) | 14.0m (6/6) | 15.3m (5/6) | 19.2m (6/6) | 20.0m (5/6) | 21.3m (6/6) | 21.6m (5/6) | 27.9m (6/6) | 28.3m (5/6) |
| random | 13.5m (5/6) | 14.9m (6/6) | 14.3m (5/6) | 15.7m (6/6) | 19.7m (3/6) | 24.3m (5/6) | 34.9m (2/6) | 28.0m (2/6) | 42.0m (2/6) | 34.9m (2/6) |
| hint | 14.6m (6/6) | 14.5m (6/6) | 15.4m (6/6) | 15.3m (6/6) | 23.3m (6/6) | 23.9m (6/6) | 24.5m (6/6) | 25.7m (6/6) | 31.1m (6/6) | 32.3m (6/6) |

- **Bot change:** the bots now keep 2 Selokan after the first banjir (`keepDrains` in `tests/scorecard/driver.ts`), as the unlock notice tells a player to. Their buying order never chose one, since a Selokan neither earns nor draws residents.
- **Shopkeeper, safety-first and Pencitraan:** within about half a minute of main. **The random placer** gets further than on main.
- **The hint reader** is up to 1.2 min slower (Kelurahan 1★ in 32.3 min against 31.1), from the floods.
- **The builder and the honest bot lose seed 4 at RT 2★.** That seed was close to the line on main, at Popularitas 73 to 79 against the 65 the star needs. The first floods cost it about 15 Popularitas. By then its 13x17 RT is full (59 path tiles and about 50 buildings), so it has no room for another Popularitas building, and expectations rise as warga keep arriving. Popularitas falls to 0 to 25 and stays there. A rule that made the bot chase Popularitas did not help, because there was nowhere to build, so it was dropped. This is the existing TODO item "Scorecard bots: the last RT stalls", and this seed is added there as a case. The banjir coming is the design, so its damage is not retuned here.

## Verdict
Self-approved under the TODO rule. GAME-DESIGN.md already says the Selokan opens after the first banjir; this makes that true again. TESTING.md: a unit test for the bug, and the player types compared against main above.
