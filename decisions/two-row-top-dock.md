# Two slim top rows, a three-button dock, louder broken paths

The person reviewed a local prototype and three top layouts, and picked layout C with a relaxed tap rule for the top bar.

- **Top: two rows of about 30px.** Row 1 is time: play/pause and speed (one size, 44x28, side by side), the date and the 2045 meter. Row 2 is money: the five resources. The goal moves to a pill over the map's top-left, opposite the satellite view. Layouts A and B wrapped the goal onto a second line; C keeps both rows on one line at every width. At 412x915 the map grew from 693 to 786px tall against the three-row prototype.
- **UI.md rule 1 exception (the person's choice, option 2).** Controls in the two top rows and the goal pill may be 28px. They are glance-and-tap readouts, not frequent actions; the frequent actions are in the 48px+ dock. The e2e legibility scan applies 28px there and 48px everywhere else.
- **Dock.** Build, Warga and Menu are three equal buttons, a 24px icon over a bold label. Build and Warga live only in the dock (`ActionButton.dock`) and the Menu stops listing them, keeping the earlier "no panel in two places" rule. The person did not answer move-or-duplicate; moving was the recommendation and matches that rule.
- **The opener** now points straight at Build in the dock, one tap shorter. Its first line says "Tap Build below"; the old "Now tap Build" step is gone.
- **Month progress** is a 4px line along the top edge of the bottom bar.
- **Broken Jalan Setapak** is greyed and cracked across the whole tile, under the pulsing red tint, orange outline and orange badge.
- Docs: GAME-DESIGN.md section 6, UI.md rules 1 and 2, ART.md (UI chrome and Broken Jalan Setapak), CONTRIBUTING.md.
