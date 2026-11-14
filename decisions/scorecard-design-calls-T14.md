# T14: the strip names only a combo the player can place

Task T14 of `docs/plans/scorecard-design-calls.md`. `easiestCombo` now skips a combo when a missing piece has no free legal site (`siteGaps`, plus a working path where the piece needs one) in reach of a piece that already stands. A hint the player cannot act on is worse than none. The scan is limited to the box around standing pieces, because the Kelurahan map is 52x68.

The executor also made `book` bots follow the strip when a star waits only on combos. Review dropped that hunk: on seeds 1 to 3 it moved shopkeeper RT 1★ from 7.3 / 4.7 / 4.7 to 8.0 / 3.2 / 7.9 min, and seed 2 then never reached RT 2★.

Review trace (shopkeeper, seed 2, first 40 weeks): the strip names Sayur Segar (Kebun Sayur + Warung) from week 7. The bot builds six Kebun Sayur over 17 weeks and the combo never fires. From week 25 it names Rapat Malam and the bot places four Pos Ronda, at (7,5), (9,7), (9,9) and (8,5), none of them beside Kantor RT at (6,8). So the slow shopkeeper RT 1★ is `buildCombo` placing pieces out of the combo's reach, not a missing hint. T15 fixes the bot.
