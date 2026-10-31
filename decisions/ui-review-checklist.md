# UI review checklist

Date: 2026-10-31. Decided by Hari in the thread "Plan review checklists for game quality".

## What changed

- UI.md gains a "Review checklist" section: checkable bars for rules 1, 2, 3, 6, 9, 11 and 12, plus 23 new items (reading the state, finding things, acting fast, feedback, learning, safety, the phone).
- Each item quotes what good looks like from a published source (Apple HIG, NN/g, Game Accessibility Guidelines, Xbox XAG 101, WCAG, web.dev, MDN) and lists its sub-checks and pass bar.
- Items are tagged [PR] (every UI PR) or [Audit] (periodic crawl).
- Bars set by a source: cold start ≤2.5s (web.dev LCP), ≥30 fps (Apple HIG Motion), text to 200% (WCAG 1.4.4).
- The 12 rules are unchanged and stay the floor.

## Why

- Hari wants agents to run UI review without his playtesting, and asked for "what good looks like" quoted, not asserted.
- Kairosoft's wiki covers mechanics, not UI, and most Kairosoft games are landscape, so most items rest on platform and accessibility guidance.
- An independent agent review of an earlier draft removed unsourced claims and merged items that duplicated the rules.

## Open

- Item 7 (Android back) fails today; items 7 and 8 are queued in TODO.md.
