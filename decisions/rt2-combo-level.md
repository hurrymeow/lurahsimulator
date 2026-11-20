# RT 2★ waits on a combo whose step hides a level

TODO item "Fix the remaining scorecard Fails that have a clear cause": the open note "RT 2★ is late in 6 of 6 seeds (rows 10 and 23)", and the RT chain misses in `decisions/worst-event-chain.md`.

## What was traced
- **The second combo is the last RT 2★ line** on every seed, for builder, honest, safety and shopkeeper (a per-tick probe of the checklist). The other three lines are done by week 20 to 30. The second combo lands at week 40 to 64.
- **The step names Sayur Segar from week 12**, as "Place side by side: Kebun Sayur, Warung Sembako". The combo is `['kebunSayur', 'warung@3']`: the Warung must be at level 3. The step never said so. In builder seed 1 a Kebun Sayur stood beside the Warung from week 24, and the combo fired only at week 64, once the Warung reached level 3.
- `easiestCombo` ranks combos by the price of the pieces still missing and ignores levels, so Sayur Segar ranks as one Rp 1jt Kebun Sayur.

## What changed
- **The step names the level:** "Place side by side: Kebun Sayur, Warung Sembako (level 3+)" / "Taruh berdampingan: Kebun Sayur, Warung Sembako (level 3+)". It reuses `needName` and the existing `combo.atLevel` string, as the Buku Combo already does. A player now knows the Warung needs two upgrades.
- A unit test checks the text in the builder's week-12 state.

## Tried and dropped
Counting the upgrades in `easiestCombo`'s ranking made the step point at Tongkrongan (Pos Ronda, Warung and Wifi Tower within 1 tile). The hint bot, which follows the step, then got slower:

| Hint bot, seeds 1 to 6 | RT 2★ (weeks) | Kel 3★ reached |
| --- | --- | --- |
| main | 64 to 72 | 5 of 6 |
| ranking with upgrades | 75 to 99 | 3 of 6 |
| ranking with upgrades, and the bot saves for the combo | 61 to 92 | 4 of 6 |

A three-piece combo with radius 1 is harder to set up than its price says. Its Wifi Tower (Rp 3.6jt) also never fits under a kas the bots keep at Rp 1jt to 4jt with upgrades. So the ranking stays as it was. Only the text changed, and no bot plays differently.

## Seen, not changed
- **RT 2★'s pace comes from that second combo** (5.5jt of pieces and upgrades for Sayur Segar, or a three-piece layout for Tongkrongan) against an RT income of about Rp 1.7jt a week that the bots spend on upgrades as it comes. Fixing the pace is a balance call:
  - a cheaper second combo near the start;
  - "1 combo" plus another line at RT 2★;
  - or a combo-easiness rank that counts layout, not just price.
- `easiestCombo`'s ranking still ignores levels. A rank that counts upgrades and layout would need its own measure.

## Verdict
Self-approved under the TODO rule. A text fix with no change to play: the bots read combo ids, not the text. `npm run typecheck` and `npm test` (708) pass, as do the goal and combo e2e tests at 320 id and 412 en (24 tests).
