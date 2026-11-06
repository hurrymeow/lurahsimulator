# Icon-first placement bar and Settings

## Decisions (made against UI.md, logged here by T1)
- Placement bar buttons become glyphs: Cancel `✕`, Rotate `↻`, Place and Yes `✓`. No new pixel art: the glyphs are plain text characters, so ART.md is not touched. Every glyph button keeps its word as `aria-label`, so screen readers and tests still read the name. This follows UI.md rule 16 (numbers and icons are not words).
- The Place button stays the one `.btn-primary` on the screen (rule 14).
- Settings: the 8 grey help lines under language, theme, both sliders and four toggles are cut from the page. Each help text moves to the control's `title` and `aria-description`, so the name and help still show on long-press or hover. Reduce motion keeps its help line, because its "follows your phone" detail changes behaviour. The satire line and the dev row stay.
- Settings On/Off words stay: one word each, and the state must be readable.
