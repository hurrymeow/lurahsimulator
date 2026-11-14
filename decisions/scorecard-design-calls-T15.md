# T15: combo pieces only in reach (executor PR #432, closed)

The executor's change limits `buildCombo` to sites in the combo's reach and buys the partner first. Review measured it locally (`runBot(bot, seed, 200)`, seeds 1/2/3, RT 1★ / 2★ / 3★ in minutes):

| bot | main (after #431) | with #432 |
| --- | --- | --- |
| shopkeeper | 7.3/9.7/11.2, 4.7/10.4/12.0, 4.7/11.5/12.3 | 4.0/7.5/7.9, 4.3/9.7/9.9, 4.1/never/never |
| builder | 0.3/9.3/10.8, 0.3/8.8/11.1, 0.3/8.5/9.9 | 0.3/12.1/14.3, 0.3/11.5/12.4, 0.3/10.1/11.2 |
| safety | 0.3/6.0/9.6, 0.3/7.5/8.9, 0.3/8.4/9.7 | 0.3/9.2/9.9, 0.3/7.9/10.8, 0.3/9.6/10.5 |

The shopkeeper gains, but the builder loses about 2 to 3 min on RT 2★ and goes past the 12 min RT 3★ ceiling on seed 1, and shopkeeper seed 3 never reaches RT 2★. Closed unmerged. The likely cause: skipping a combo when its piece has no in-reach site stops pieces that used to fall into other combos by chance. This is iterative bot tuning that needs local runs between edits, so it goes to a Sonnet thread, not the executor.
