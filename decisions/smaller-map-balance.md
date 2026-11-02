# Smaller map T8: balance

Plan: `docs/plans/smaller-map.md`, task T8. Numbers come from `npm run scorecard` on 9 bots and 10 seeds, 340-tick bot runs and the RW and Kelurahan bot tests. "Before" is main after T7, unless it names the Nightly of 2026-11-01, which ran before the smaller map.

## The plan's risks

| Risk | Answer |
| --- | --- |
| Stempel may stop mattering | **Yes.** Backlog stayed at 0 and clear ran about 225 weeks on every run. Changed. |
| Income changes shape | **Partly.** Cash over 5x the next key item fell from 34.1 to 20.1 min. Still a Fail, as before, and better. Rupiah at the Kelurahan is still high (Rp 100jt to 2,6 miliar at week 340). |
| Serapan may get harder | **No, the opposite.** Dana counts as spending. Serapan read 375% to 5,800% before tuning, and higher after, so it never blocks anyone. The 48-week run only sets a minimum time for 1★. |
| Pacing | Bands did not move. See below. |

## Changes

- **Each resident drains 0.7x the Popularitas at the Kelurahan** (`EXPECT_KEL`). This is the main fix and the one rule the plan did not list. The player's land doubles at promotion and Kampung Sebelah's warga join, so bots settled at 200 to 400 residents and Popularitas 24 to 41, under the 1★ bar of 50 and the 2★ bar of 45. The Kecamatan already has this rule at 0.6x.
- **Stempel refills 1 a month, not 3, and a build sends 2 letters, not 1.** Balai RW still adds 1. Most RTs peak at 2 letters, and Jarang Muncul, which sends double, peaked at 18. Tried and rejected: refill 2 with 3 letters (peak 3, still no pressure) and refill 1 with 3 letters (peak 70, and 2 RW bot seeds fell to 0 stars).
- **Rival scale: RW 2.2 (was 1.5), Kelurahan 3.8 (was 2.6), Kecamatan 4.75 (was 3.25).** The first ranking at each stage was won by 2x to 3x. It is now about 1.0x to 1.6x, and the closest was 1545 to 1509. No bot lost a ranking in the 340-tick runs I read, and the player's score still pulls away within a few years.
- **Scorecard bots pay for the first clean audit**, as the Kelurahan bot does since T5 (`tests/scorecard/driver.ts`). The free choice is clean only with no stale wacana, and these bots always have one.

Left alone: Anggaran and fund costs. Lowering Anggaran would not change Serapan's verdict, and cash health already improved. A later cash pass can look at it.

## Results

Median minutes at 1x, local scorecard:

| Bot | Kel 1★ before | Kel 1★ now | Kel 2★ before | Kel 2★ now | Kel 3★ before | Kel 3★ now |
| --- | --- | --- | --- | --- | --- | --- |
| builder | 27.7 (7/10) | 28.9 | 0/10 | 33.1 (8/10) | 0/10 | 38.4 (8/10) |
| shopkeeper | 27.1 (7/10) | 27.3 | 0/10 | 33.1 | 0/10 | 38.4 |
| safety | 27.5 (8/10) | 27.6 (9/10) | 33.1 (5/10) | 33.1 (9/10) | 38.4 (5/10) | 38.4 (9/10) |
| hint | 27.3 | 27.3 | 0/10 | 33.1 | 0/10 | 38.4 |

Against the Nightly of 2026-11-01, no scorecard row changed verdict. Row 24 had become a new Fail after T5 and is Unknown again. The RT rows were late before this work and are not touched.

## For Hari

- **Stage lengths are still short of the plan's targets, and no band moved.** The builder spends about 6.5 min at the RW (target about 20) and about 16 min at the Kelurahan (target about 30). The Kelurahan is longer than before, when it ran about 4 min to 2★.
- **Kel 2★ and 3★ land at the same minute on nearly every bot** (33.1 and 38.4). Something on a fixed clock sets them, not how well the bot plays. I did not trace it, and it is worth a look in the playtest.
- **Two builder seeds still stick at Kel 1★.** On seeds 1 and 7, Popularitas stays at 24 and 9 at week 340. This is the existing TODO "Stop a big kampung getting stuck under the Kelurahan 3★ Popularitas bar", which T8 eases but does not close.
- **The Kelurahan seed still opens with far more residents than its goals ask for** (226 at T5, against 200 for 3★). It is a debug start and not a real game.
