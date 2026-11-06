# Icon-first placement bar and Settings

## Goal
TODO "Swap text buttons for icons in build placement and Settings" (Hari, 2026-11-06: "use more icon as ui text ... less words, simpler ui"; "yes if deepseek can do"). Two Sonnet-tier tasks for the DeepSeek executor trial, one per screen. Review each PR before merge; judge it against UI.md rules 14 to 17 and the review checklist.

## Decisions (made against UI.md, logged in decisions/icon-first-ui.md by T1)
- Placement bar buttons become glyphs: Cancel `✕`, Rotate `↻`, Place and Yes `✓`. No new pixel art: the glyphs are plain text characters, so ART.md is not touched. Every glyph button keeps its word as `aria-label`, so screen readers and tests still read the name. This follows UI.md rule 16 (numbers and icons are not words).
- The Place button stays the one `.btn-primary` on the screen (rule 14).
- Settings: the 8 grey help lines under language, theme, both sliders and four toggles are cut from the page. Each help text moves to the control's `title` and `aria-description`, so the name and help still show on long-press or hover. Reduce motion keeps its help line, because its "follows your phone" detail changes behaviour. The satire line and the dev row stay.
- Settings On/Off words stay: one word each, and the state must be readable.

## Tasks

### T1. Placement bar uses glyph buttons (Sonnet, executor trial)
- Files: `index.html`, `src/app.ts`, `tests/e2e/ui.spec.ts`, `decisions/icon-first-ui.md`, `progress/icon-first-ui-T1.md`
- Exact changes: in `index.html` the placement buttons `#place-cancel`, `#place-rot`, `#place-ok` and `#place-exit` get a glyph as their text (`✕`, `↻`, `✓`, `✕`) and `data-i18n-aria` instead of `data-i18n`: `page.cancel`, `insp.rotate`, `page.place`, `page.cancel`. In `src/app.ts` `updatePlacing` set `btn.textContent = '✓'` where it now sets `t('page.yes')` or `t('page.place')`, and set `btn.setAttribute('aria-label', t(...))` with the same keys, so the label reads Place or Yes as before. In `tests/e2e/ui.spec.ts` change the three `#place-ok` `toHaveText('Pasang')` and `toHaveText('Place')` checks (about lines 785 to 797) to `toHaveAttribute('aria-label', ...)`. No new i18n keys. Write `decisions/icon-first-ui.md` with the Decisions section above and `progress/icon-first-ui-T1.md`.
- Done when: `npm run typecheck` and `npm test` pass; `npx playwright test tests/e2e/ui.spec.ts -g "Bahasa Indonesia" --project=phone-320-id` and `--project=phone-412-en` pass; the placement bar still has exactly one filled button.
- Don't touch: `src/style.css`, `src/i18n/`, the inspect panel's Rotate button (`src/ui/inspect.ts`), TODO.md. Do not run the full e2e suite.

### T2. Settings without the help lines (Sonnet, executor trial)
- Files: `src/ui/settings.ts`, `tests/e2e/density.ts`, `progress/icon-first-ui-T2.md`
- Exact changes: in `src/ui/settings.ts` remove the `h('p', { class: 'meta' }, t(...help))` from `toggleRow`, `languageRow`, `themeRow` and `sliderRow`, except for the `reduceMotion` toggle, which keeps it. Put the help text on the control instead: `title` and `aria-description` attributes on the toggle button, on each language and theme button's row container, and on the slider input. Leave the satire line, `devRow` and the new-game row alone. Then run the spec that reads `tests/e2e/density.ts` for the Settings screen at 320 and 412 in id and en, read the measured words in view, and in `tests/e2e/density.ts` lower the `settings` `wordsInView` limit (now 65) to the highest measured value rounded up to the next 5.
- Done when: `npm run typecheck` and `npm test` pass; the touched e2e specs pass (`npx playwright test tests/e2e/canary.spec.ts --project=phone-320-id --project=phone-412-en` (find the exact spec that reads `density.ts` first)); the new `wordsInView` is lower than 65.
- Don't touch: i18n files (the help strings stay in use as titles), `src/style.css`, other screens, TODO.md. Do not run the full e2e suite.
