# T5: builder and Orang Dalam in B1

Verdict: PR #443 closed, not merged. The T5 done-check failed, and the change worked by accident.

## What the executor did
It made `builderOrder` return only `['kosan']` from RT 1★ until a Kosan stands. Kosan costs Rp 3,000,000. The builder never afforded it with its buffer, so no Kosan was built in 80 ticks on seed 1. The list stayed `['kosan']` for the rest of the run, so `buildFrom` never bought the normal builder list again. `odn` in B1 was the same as on main to the decimal, so Orang Dalam still never falls in B1.

## What it showed
Builder seeds 1 to 3, star minutes at 1x (RT 1★, 2★, 3★, RW 1★, 2★, 3★):

| Seed | main (d16ba95) | #443 |
| --- | --- | --- |
| 1 | 0.3, 9.3, 10.8, 12.0, 26.9, 27.7 | 0.3, 5.1, 7.7, 9.2, 19.9, 24.0 |
| 2 | 0.3, 8.8, 11.1, 12.1, 26.9, 27.6 | 0.3, 4.8, 7.5, 8.5, 21.2, 27.2 |
| 3 | 0.3, 8.5, 9.9, 11.1, 25.3, 28.8 | 0.3, 4.9, 7.1, 8.9, 26.0, 26.5 |

With the generic builder list switched off, money goes to combo pieces (`buildCombo`) and Rumah. RT 2★ drops from about 9 min to about 5 min. So most of the builder's late RT 2★ comes from the bot spending on low-value kinds before the combo line, not from the game. The RT 2★ combo line should not be eased on the strength of the builder bot alone.

## Why Orang Dalam does not fall
The builder never places a permit building in B1. Kosan is the only RT 1★ permit kind and is too dear for B1 at the builder's buffer. Barbershop has no permit. A real player may also bank Orang Dalam here; item 13 should count Orang Dalam as having a sink once the first permit building appears, not in B1.

## Next
New plan task: make the builder buy its generic list only after the next star's combo line is met (or a combo piece is unaffordable), then re-measure RT 2★ on 10 seeds. Item 13's B1 Orang Dalam bar moves to B2.
