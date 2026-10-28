# UI rules

Twelve measurable UI and UX rules for Pak Pejabat. A PR that touches a screen, text or layout is checked against them. Approved by Hari, 2026-10-27.

Layout, art, feedback and tech rules live in [GAME-DESIGN.md](GAME-DESIGN.md) section 6. Pacing targets live in section 3. This file holds only the numbers and limits.

## Rules

### Touch and layout

1. **Tap targets are 48px or more, with 8px gaps.** Material says 48dp and 8dp ([Google](https://support.google.com/accessibility/android/answer/7101858)). Apple says 44pt ([Deque](https://dequeuniversity.com/rules/attest-ios/1.0/touch-target-size)). WCAG 2.2 AA says 24px ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)). We use 48 because thumbs miss on 320px phones. **Exception:** the two slim top rows and the goal pill on the map may use 28px controls, so more of the map shows. They hold glance-and-tap readouts (play, speed, the resources, the 2045 meter, the goal), not frequent actions; the frequent actions sit in the 48px+ dock at the bottom.
2. **The main screen is two slim top rows (time: play, speed, date, 2045; money: the resources), the map with a goal pill and a small satellite view, and a bottom dock of three equal buttons: Build, Warga, Menu. Nothing else** (GAME-DESIGN.md section 6). Notices float over the map as a 3s toast and stay in the Log. Build and Warga live only in the dock; everything else opens from Menu, and no panel appears in two places. On phones 640px tall or less the satellite view drops out.
3. **The primary action sits in the bottom third.** Reason: thumb reach in portrait.

### Legibility

4. **Body text is 16px or more, contrast 4.5:1 or more.** Disabled buttons stay readable, never faded. Reason: glare and small screens.
5. **Nothing clips, ellipsizes or leaves the screen** at 320, 360, 412 and 430px, in English and Indonesian. Indonesian runs longer, so 320px in Indonesian is the stress case. **Exception:** a line may be clamped (marked `data-clamp`) when it sits inside a button that opens the whole text in one tap. Two places use it: the goal pill (one line) and the effect on a Buku Combo card (two lines). The e2e scan skips ellipsis and clipping only there.
6. **One icon, one meaning, a familiar shape,** always with a label or a number. Colour never carries meaning alone.

### Text

7. **A tutorial step is one idea in 20 words or fewer.** Teach one thing at a time ([GameAnalytics](https://gameanalytics.com/blog/tips-for-a-great-first-time-user-experience-ftue-in-f2p-games), [Supersonic](https://supersonic.com/learn/blog/optimizing-ftue/)). The sources give no word count, so 20 is a judgement call.
8. **Event and pop-up bodies and building blurbs are 25 words or fewer.** Every pop-up uses one layout: title, body, labelled result rows, buttons at the bottom.
9. **Every unmet requirement says what is missing.** A disabled button is never silent.

### Tutorial and feedback

10. **The tutorial never covers the control it points at.** Text advances on tap, never on a timer. Only the multi-step first-build tutorial has Skip. One-card tips say "Tap to continue" and nothing else.
11. **Feedback follows a ladder.** Routine income gets a small number pop. A combo or unlock gets fanfare. The game works with effects, motion and sound off.
12. **Every tap shows feedback within 100ms.** The first house is built within 30s of New Game (target 1 in GAME-DESIGN.md section 3).

## How each rule is checked

| Rules | Check |
| --- | --- |
| 1, 4, 5 | `npm run e2e` legibility scan, 4 widths, 2 languages |
| 7, 8 | Word count over `src/i18n/en.ts` and the event data. Not automated. |
| 2, 3, 6, 9, 10, 11 | Review against the audit crawl screenshots |
| 12 | Timed run. Not automated. |
| Layout drift | Screenshot baselines (`tests/e2e/visual.spec.ts`): home, HUD, Build sheet, event popup, tip card. 412px, 2 languages. |

Every new panel or message needs a scan in `tests/e2e/ui.spec.ts`. CI runs the suite on every PR. The audit crawl scripts are in the project files, not in the repo.

## Screenshot baselines

A baseline diff means a screen changed. Decide whether the change was meant.

- Intended change: run Actions > Update baselines on your branch. It redraws the PNGs in CI's own Playwright image and commits them.
- Attach the before and after of each changed screen to the PR.
- Never refresh baselines to make CI pass. An unexpected diff is a bug to fix.
- Do not draw baselines on your own machine. Fonts and rendering differ from CI.

## Status, 2026-10-27

- Rules 1 to 6, 9 and 11 pass. The legibility scan found no hits on any screen.
- Rules 7 and 8 failed at adoption. Ten strings and one blurb were trimmed in #90 and #91.
- The Paused pill no longer floats over open sheets (#92).
- Rule 12 is an estimate of about 25 to 35s to the first house, not a timed measurement.
