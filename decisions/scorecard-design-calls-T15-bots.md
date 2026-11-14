# T15 and T2: shopkeeper builds its first combo at once

Replaces executor PR #432 (closed, see `scorecard-design-calls-T15.md`). Bot code only: one value in `tests/scorecard/driver.ts`, `shopkeeper.comboFrom: 0`.

## Cause
RT 1★ needs one combo. Shopkeeper bought shops first and only looked for a combo from week 12 (`COMBO_HINT_MONTH`). By then its shops filled the tiles around Kantor RT, so Rapat Malam (Kantor RT + Pos Ronda, radius 1) had no free site in reach. The fallback kept buying Pos Ronda copies out of reach and Kebun Sayur copies beside a Warung that was still level 2 (Sayur Segar needs Warung at 3). So the first combo came at 4.7 to 7.3 min, by chance.

The builder and safety bots already find a combo in the first minute, because their orders buy a Pos Ronda early.

## What was tried and dropped
All measured on seeds 1 to 3, `runBot(bot, seed, 500)`.
- Place pieces only in reach, skip a combo with no site (#432's idea). Shopkeeper RT 1★ 4.0 to 4.7 min, no better than the late start, and `never` for RT 3★ on two seeds.
- Rank combos by upgrade cost (Warung at 3 is about 6M). Builder RT 2★ slowed by up to 1 min on seed 1 and safety by 1.7 min.
- Stop buying Kebun Sayur copies once one touches the Warung. Builder RT 2★ slowed by 2 to 3 min. Its chance combos depended on those copies.
- Follow the strip (`combo: 'hint'`) for shopkeeper. RT 2★ never on all three seeds.
- Safety: buy Balai RW first for every plan. No change in any time. The RW combo branch in `playPlan` already runs for every plan and no cap blocks it, so T2 needs no code change.

## Result (minutes, stars 1 to 6, builder and safety unchanged to the decimal)
| bot | RT 1★ / 2★ / 3★ before | after |
| --- | --- | --- |
| shopkeeper seed 1 | 7.3 / 9.7 / 11.2 | 0.5 / 5.3 / 6.5 |
| shopkeeper seed 2 | 4.7 / 10.4 / 12.0 | 0.5 / 6.0 / 7.2 |
| shopkeeper seed 3 | 4.7 / 11.5 / 12.3 | 0.5 / 6.0 / 6.9 |

RW 1★ to 2★ gap, safety: 5.7 / 6.4 / 6.4 min on seeds 1 to 3, before and after. That is under the 14 min ceiling, so no change.

## What it means for the scorecard
Shopkeeper now reaches RT 3★ about 4 min before the builder. Rows 7, 10 and 17 judge strategy bots against the section 3 targets; re-run Nightly and re-judge them. The builder is the slowest at RT 2★ (8.1 to 9.3 min, target 4), so that lever is still open and is for the next plan (number of combos, not the bar).
