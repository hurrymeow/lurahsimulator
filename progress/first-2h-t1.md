# First 2h playtest, T1 (scorecard and Kecamatan rows)

- The scorecard report has a B0 to B5 band table: novelty max, goal max, star gap and stop point gap, per bot, worst seed.
- New Nightly job `scorecard-kec` plays the hint bot from a new game to Kelurahan 3 stars, then the Kecamatan bot, on 10 seeds. It measures first pinjol case, stop point gap, judol share and Baliho income. The report prints them with the bars.
- First local run (seed 1): the hint bot arrives at the Kecamatan with 436 residents, far above the shortcut start, and the Kecamatan bot gets no star in 700 weeks (pinjol 45%, judol 76%). Read as a bot gap until the Nightly shows the other seeds. No game numbers changed.

Nightly run 42452557995 (10 seeds): all 10 reached the Kecamatan at 38.5 min, none earned a Kecamatan star in 700 weeks. Judol sat at 76% mean (peak 85 to 90%) and no Baliho was ever built (it opens at 1★). The follow-up counts the wait still open at the end of a run and shows stars-only stop gaps next to the report-counted ones.
