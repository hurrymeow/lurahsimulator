# The yearly price banner

TODO item "The yearly price banner" (voidinside99, 2026-11-01). Spec: `decisions/staff-requests.md` section 4.

- From year 2, the year-end notice is a banner card instead of the old "Year N begins" toast. The title is "PERHATIAN: Biaya hidup naik {x}% di tahun {n}" (EN "NOTICE: Cost of living up {x}% in year {n}"). The body is one reason from the 12-line bank in section 4.
- The reason is drawn with the game's seeded RNG and is never the same as last year's (`priceReason` in the save). Old saves have no `priceReason`, so their first banner can draw any of the 12.
- The card has a yellow and dark hazard stripe and a red pixel-font title, so it reads as an official notice, not an event. It closes with one tap, like every other information card (UI.md checklist item 11, Card tier). The year-end Log line keeps the same text.
- The English reasons are translations that keep each joke about how an economy behaves, never about a group of people (the swap test). "Gas melon" became "small gas cylinders", because the nickname means nothing in English.
- The `{x}` is `INFLATION_PER_YEAR`, unchanged.

Verdict (self-approved): `tests/price-banner.test.ts` covers 40 years. Every year has the card, no reason repeats twice in a row, all 12 appear, and every reason is 25 words or fewer in both languages (UI.md rule 8). The e2e test shows the card and checks it is legible at 320 and 430px ID and 412px EN.
