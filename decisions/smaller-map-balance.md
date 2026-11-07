# Smaller map T8: balance

Plan: `docs/plans/smaller-map.md`, task T8. Numbers come from `npm run scorecard` on 9 bots and 10 seeds, 340-tick bot runs and the RW and Kelurahan bot tests. "Before" is main after T7, unless it names the Nightly of 2026-11-01, which ran before the smaller map.

## The plan's risks

| Risk | Answer |
| --- | --- |
| Stempel may stop mattering | **Yes.** Backlog stayed at 0 and clear ran about 225 weeks on every run. Changed. |
| Income changes shape | **Partly.** Cash over 5x the next key item fell from 34.1 to 18.9 min. Still a Fail, as before, and better. Rupiah at the Kelurahan is still high (Rp 100jt to 2,6 miliar at week 340). |
| Serapan may get harder | **No, the opposite.** Dana counts as spending. Serapan read 375% to 5,800% before tuning, and higher after, so it never blocks anyone. The 48-week run only sets a minimum time for 1★. |
| Pacing | Bands did not move. See below. |

## Changes

- **Each resident drains 0.7x the Popularitas at the Kelurahan** (`EXPECT_KEL`). This is the main fix, and one of two rules the plan did not list. The player's land doubles at promotion and Kampung Sebelah's warga join, so bots settled at 200 to 400 residents and Popularitas 24 to 41, under the 1★ bar of 50 and the 2★ bar of 45. The Kecamatan already has this rule at 0.6x.
- **An absorbed RT's buildings no longer count toward sprawl** (`Neighbour.joined`). This is a bug from T5, and the second rule the plan did not list. T5 hands the player Kampung Sebelah's buildings at promotion, and each one made every later building dearer. A Kantor Kecamatan cost Rp 612jt against Rp 86jt of cash.
- **Stempel refills 1 a month, not 3, and a build sends 2 letters, not 1.** Balai RW still adds 1. Most RTs peak at 2 letters, and Jarang Muncul, which sends double, peaked at 18. Tried and rejected: refill 2 with 3 letters (peak 3, still no pressure) and refill 1 with 3 letters (peak 70, and 2 RW bot seeds fell to 0 stars).
- **Rival scale: RW 2.2 (was 1.5), Kelurahan 3.8 (was 2.6), Kecamatan 4.75 (was 3.25).** The first ranking at each stage was won by 2x to 3x. It is now about 1.0x to 1.6x, and the closest was 1545 to 1509. No bot lost a ranking in the 340-tick runs I read, and the player's score still pulls away within a few years.
- **Scorecard bots pay for the first clean audit**, as the Kelurahan bot does since T5 (`tests/scorecard/driver.ts`). The free choice is clean only with no stale wacana, and these bots always have one.
- **The Kecamatan bot plays more like a player** (`tests/kec-bot-lib.ts`). It saves for the Kantor Kecamatan. It builds a Pos Satpam for each preman, then Lampu Jalan while Aman across the Kecamatan is under 67, replacing the commonest building that gives no jobs or Popularitas when the map is full. The test's bars did not change.

Density cap for the Warga screen goes from 488 to 494 words (`tests/e2e/ui.spec.ts`). The sprawl fix changes the Kelurahan debug seed, and that seed's resident list is what the test counts. No UI text changed.

Left alone: Anggaran and fund costs. Lowering Anggaran would not change Serapan's verdict, and cash health already improved. A later cash pass can look at it.

## Results

Median minutes at 1x, local scorecard:

| Bot | Kel 1★ before | Kel 1★ now | Kel 2★ before | Kel 2★ now | Kel 3★ before | Kel 3★ now |
| --- | --- | --- | --- | --- | --- | --- |
| builder | 27.7 (7/10) | 28.9 | 0/10 | 33.1 | 0/10 | 38.4 |
| shopkeeper | 27.1 (7/10) | 27.3 | 0/10 | 33.1 | 0/10 | 38.4 |
| safety | 27.5 (8/10) | 27.7 | 33.1 (5/10) | 33.1 | 38.4 (5/10) | 38.4 |
| hint | 27.3 | 27.3 | 0/10 | 33.1 | 0/10 | 38.4 |

Against the Nightly of 2026-11-01, no scorecard row changed verdict. Row 24 had become a new Fail after T5 and is Unknown again. The RT rows were late before this work and are not touched.

Kecamatan bot, `tests/kec-bot.test.ts` bars, weeks after promotion:

| Seed | 1★ | 2★ | 3★ | Pinjol | Residents |
| --- | --- | --- | --- | --- | --- |
| 3 | 113 | 250 | 425 | 4% | 414 |
| 4 | 209 | 250 | 425 | 8% | 427 |

3★ at week 425 is 56.7 min, inside the 45 to 70 band, and the district clock sets it. I ran this through a temporary test, because `tests/kec-bot.test.ts` writes to `/tmp`, which fails on Windows. The test's comment says it runs in the nightly job, but `nightly.yml` does not run it, so no CI run checks this result.

## Open notes

- **Stage lengths are still short of the plan's targets, and no band moved.** The builder spends about 7 min at the RW (target about 20) and about 16 min at the Kelurahan (target about 30). The Kelurahan is longer than before, when it ran about 4 min to 2★.
- **Kel 2★ and 3★ land at the same minute on nearly every bot** (33.1 and 38.4). Something on a fixed clock sets them, not how well the bot plays. I did not trace it, and it is worth a look in the playtest.
- **Preman can sink Aman at the Kecamatan.** Before the bot built Pos Satpam, it had 15 to 66 preman, its own Aman read 0 and the 2★ Aman goal never moved. The Kecamatan bot ended with about 55 Lampu Jalan and 23 to 27 Pos Satpam, far more than a person would place. Watch whether a player can see this and fix it.
- **These bot runs do not use the road rule.** `tests/setup.ts` turns it off, so the bot's buildings work without a road. A real player has less room for Pos Satpam and lamps than the bot had.
- **The Kecamatan has long waits between goals.** The longest wait between two goal lines was 172 weeks (about 23 min) on seed 3 and 96 weeks (about 13 min) on seed 4.
- **The Kelurahan seed still opens with far more residents than its goals ask for** (226 at T5, against 200 for 3★). It is a debug start and not a real game.
