# Kelurahan playable

- Flipped `playable` on Kelurahan. 2x2 footprints come from #53 (Kelurahan buildings default to 2).
- Bug fixed: the month a new budget lands counted as 0% serapan and reset the run, so 12 months in a row was impossible. That month now neither counts nor breaks the run.
- Bot check (`tests/kel-bot.test.ts`): a fund-and-spend routine reaches 1 star in at least 2 of 3 seeds within 6 years.
- Not checked: Kelurahan 2 and 3 stars, and RW 3 stars.
