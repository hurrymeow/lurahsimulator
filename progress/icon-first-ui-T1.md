# T1: placement bar uses glyph buttons

The four placement buttons (`#place-cancel`, `#place-rot`, `#place-ok`, `#place-exit`) now show `✕`, `↻`, `✓`, `✕` instead of words, and carry their names through `data-i18n-aria`. `updatePlacing` writes `✓` and sets the matching `aria-label` (`page.place` or `page.yes`) as the state changes, so the Place button stays the single filled primary action and screen readers still read its name. The e2e checks that asserted the button text now assert its `aria-label`; this includes the path-preview Yes check, which the same text change affects.

Reviewed 2026-11-07: diff matches the task. Placement glyphs checked in Chromium and WebKit at 412; Settings density passes in EN and ID.
