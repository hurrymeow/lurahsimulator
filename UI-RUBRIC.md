# UI rubric

Measurable UI and UX rules for Pak Pejabat. Approved by Hari, 2026-10-27.
DESIGN.md holds the broader rules. This file holds the numbers a PR is checked against.
Pacing and balance live in PACING.md, not here.

## Rules

1. **Tap targets 48px or more, 8px gaps.** Matches Material's 48dp and 8dp ([Google](https://support.google.com/accessibility/android/answer/7101858)). Apple's 44pt is lower ([Deque](https://dequeuniversity.com/rules/attest-ios/1.0/touch-target-size)). WCAG 2.2 AA floor is 24px ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)). We stay at 48 because thumbs miss on 320px phones.
2. **Body text 16px or more, contrast 4.5:1 or more.** Disabled buttons never fade. Reason: glare and small screens.
3. **No clipping, ellipsis or off-screen text** at 320, 360 and 390px, in English and Indonesian. Indonesian runs longer, so 320 id is the stress case.
4. **Main screen has four parts:** resource bar, map, one bottom row, nothing else. Everything else opens from Menu.
5. **Primary action sits in the bottom third.** Reason: thumb reach in portrait.
6. **One icon, one meaning, familiar shape,** always with a label or number. Colour never carries meaning alone.
7. **Tutorial steps: one sentence, 20 words or fewer.** One thing per step ([GameAnalytics](https://gameanalytics.com/blog/tips-for-a-great-first-time-user-experience-ftue-in-f2p-games), [Supersonic](https://supersonic.com/learn/blog/optimizing-ftue/)). The sources give no word count. The limit is a judgement call.
8. **Event and pop-up bodies 25 words or fewer.** Every pop-up uses one layout: title, body, labelled result rows, buttons at the bottom.
9. **Every unmet requirement says what is missing.** Disabled is never silent.
10. **Tutorial never covers the control it points at.** Text advances on tap only. Only the multi-step first-build tutorial has Skip. One-card tips use "Tap to continue" and nothing else.
11. **Feedback ladder.** Routine income gets a small number pop. Combo or unlock gets fanfare. The game works with effects, motion and sound off.
12. **Timing.** First house placed within 30s of New Game (target owned by PACING.md). Every tap shows feedback within 100ms.

## How rules are checked

- Rules 1, 2, 3: `npm run e2e` legibility scan, 3 widths, 2 languages.
- Rules 7, 8: word-count check over `src/i18n/en.ts` and event data. Not automated yet.
- Rules 4, 5, 6, 9, 10, 11: review against the audit crawl screenshots.
- Rule 12: timed Playwright run. Not automated yet.
- The audit crawl scripts live in the project files under `audit/crawl/`.

## Score at adoption (2026-10-27)

- Pass: 1, 2, 3, 6, 9, 11. Legibility scan found 0 hits on every screen.
- Fail 7: `coach.done` is 28 words, `coach.menu` is 19.
- Fail 8: one event body is 33 words (median 17). `wac.intro` 33 and `decay.crackBody` 32. Five How to play bodies run 26 to 28. About 9 strings in total.
- Open: the "Paused" pill stays over the map under open sheets.
- Unscored: rule 12 needs a timed run.
