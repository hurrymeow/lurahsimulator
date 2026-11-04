# The last nine props inside their tiles: SPILL_ALLOW is empty

TODO item "Keep the last 9 shop props inside their footprint" (UI.md rule 17). #304 fixed the painter bugs, and this change moves the props that were drawn past the front edges on purpose. Each stays the same prop, moved a few pixels up, back or in:

| Sprite | Prop | Change |
| --- | --- | --- |
| Pos Satpam | the barrier arm | shorter and flatter, ending before the front-right edge |
| Warung | the stool (level 1), the bench (levels 2 and 3), the LPG melon (level 3) | moved in toward the stall |
| Indomaret, Alfamart | the tiang reklame and the ATM column (level 2) | feet raised 2px, signs raised with them |
| Praktik Bidan | the practice board's post | foot raised 4px, board raised with it |
| Kantor RT | the nameboard's post | foot raised 4px, board raised with it |
| Bank Sampah | the sorting bins and the gerobak sampah (level 2) | moved back from the front edges |
| Portal | the front post | foot raised 2px, boom angle eased to match |
| Baliho | the front leg | foot raised 2px |

`SPILL_ALLOW` in `tests/footprint-art.test.ts` is now empty. Every building sprite, at every level, stays above its footprint's two front edges. A new spill needs a reason here and an entry there.

Verdict (self-approved): checked by eye on a contact sheet with each footprint outlined. `npm test` passes (617). The screenshot baselines are refreshed in CI, because these sprites moved.
