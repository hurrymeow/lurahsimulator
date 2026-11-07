# The SK as a ceremony, and combos that wait on an upgrade

Two TODO items from the Next tier, done together because both are small.

## The SK is a ceremony
TODO item "Make the SK promotion feel like a big moment, not a menu item" (Hari, 2026-11-06: "sk should feel more wow and not just hidden in menu").

- **The card names the post and accepts it.** The SK notice was a plain fanfare card, "An SK has arrived", saying to open the Menu. It now reads "Your SK: Pak RW!" (ID "SK-mu: Pak RW!"). The title is the next stage's first title, so the RW gives Pak Lurah and so on. It carries its own primary button, "Accept the SK", or at the RW the Kelurahan-path label, which accepts on the spot. Tapping outside closes the card, as on every card, and the SK waits.
- **A waiting SK is reached from the map.** While it waits, the goal pill reads "accept your SK" (was "accept the SK in Menu"), and a tap on the pill brings the ceremony card back. The stage sheet in Menu keeps accept and decline.
- **Not done:** no new art or sound. The card already gets the fanfare look, sound and haptics. A stamp graphic could follow if Hari wants more.

UI.md: one primary on the card (rule 14). The button passes the 48 px touch scan once the card's pop-in has landed. Its label is 3 words (rule 16). E2e: "the SK is a ceremony" at 320 px ID, 320 px EN and 412 px EN.

## Sayur Segar did not light up on an upgrade
TODO item "Sayur Segar combo does not activate when a building in it is upgraded".

- **Cause:** the income side was already right. The combo cache is keyed on building levels, so the x1.25 counted on the same tick. The notice and the Combo book entry came from `discoverCombos`, which ran on the weekly tick and after a move, not after an upgrade. So the player upgraded the Warung to level 3, saw nothing, and got the card a week later.
- **Fix:** the building panel's upgrade button runs `discoverCombos` and shows its cards at once. This covers every combo that needs a level, not only Sayur Segar.
- **Test:** the e2e test "upgrading the last piece of a combo lights it up at once" fails without the fix.

## Verdict
Self-approved under the TODO rule against the UI.md checklist and TESTING.md. GAME-DESIGN.md section 1 gains one line on how the SK is shown. No sim rule a bot reads changed, so the player types were not rerun.
