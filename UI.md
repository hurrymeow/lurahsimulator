# UI rules

Seventeen measurable UI and UX rules for Pak Pejabat. A PR that touches a screen, text or layout is checked against them. Approved by Hari, 2026-10-27. The [Review checklist](#review-checklist) below adds bars for six rules and 23 more items (2026-10-31). Rules 14 to 17 and the changes to 5, 10 and 13 were approved by Hari on 2026-11-01 (decisions/ui-rules-2026-11-01.md).

Layout, art, feedback and tech rules live in [GAME-DESIGN.md](GAME-DESIGN.md) section 6. Pacing targets live in section 3. This file holds only the numbers and limits.

## Rules

### Touch and layout

1. **Tap targets are 48px or more, with 8px gaps.** Material says 48dp and 8dp ([Google](https://support.google.com/accessibility/android/answer/7101858)). Apple says 44pt ([Deque](https://dequeuniversity.com/rules/attest-ios/1.0/touch-target-size)). WCAG 2.2 AA says 24px ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)). We use 48 because thumbs miss on 320px phones. Buttons side by side in one row are the same width (equal grid columns; a long label wraps inside its button), and a row that wraps keeps that width on every line. **Exception:** the two slim top rows and the goal pill on the map may use 28px controls, so more of the map shows. They hold glance-and-tap readouts (play, speed, the resources, the 2045 meter, the goal), not frequent actions; the frequent actions sit in the 48px+ dock at the bottom.
2. **The main screen is two slim top rows (time: play, speed, date, 2045; money: the resources), the map with a goal pill and a small satellite view, and a bottom dock of three equal buttons: Build, Warga, Menu. Nothing else** (GAME-DESIGN.md section 6). Notices float over the map as a 3s toast and stay in the Log. Build and Warga live only in the dock; the Combo book opens from a button in the Build sheet header; everything else opens from Menu, and no panel appears in two places. On phones 640px tall or less the satellite view drops out. The satellite view's fold button (48px tap area) and the PAUSED pill are part of the map, not extra screen furniture.
3. **The primary action sits in the bottom third.** Reason: thumb reach in portrait.

### Legibility

4. **Body text is 16px or more, contrast 4.5:1 or more.** Disabled buttons stay readable, never faded. Reason: glare and small screens.
5. **Nothing clips, ellipsizes or leaves the screen** at 320, 360, 412 and 430px, in English and Indonesian. Indonesian runs longer, so 320px in Indonesian is the stress case. There are no exceptions: text that does not fit is rewritten shorter, never cut with "…". Known fails on 2026-11-01: the goal pill and the Combo card effect still clamp (`data-clamp`); the scan skips them until they are fixed.
6. **One icon, one meaning, a familiar shape,** always with a label or a number. Colour never carries meaning alone.

### Text

7. **A tutorial step is one idea in 20 words or fewer.** Teach one thing at a time ([GameAnalytics](https://gameanalytics.com/blog/tips-for-a-great-first-time-user-experience-ftue-in-f2p-games), [Supersonic](https://supersonic.com/learn/blog/optimizing-ftue/)). The sources give no word count, so 20 is a judgement call.
8. **Event and pop-up bodies and building blurbs are 25 words or fewer.** Every pop-up uses one layout: title, body, labelled result rows, buttons at the bottom.
9. **Every unmet requirement says what is missing.** A disabled button is never silent.

### Tutorial and feedback

10. **The tutorial never covers the control it points at, and has no Skip.** Text advances on tap, never on a timer. While a step names a control, only that control takes taps; the coach note, event pop-ups and Cancel are the only other things that respond. One-card tips say "Tap to continue" and nothing else.
11. **Feedback follows a ladder.** Routine income gets a small number pop. A combo or unlock gets fanfare. The game works with effects, motion and sound off.
12. **Every tap shows feedback within 100ms.** The first house is built within 30s of New Game (target 1 in GAME-DESIGN.md section 3).

### Density

13. **Each screen shows little text at a time, and detail waits behind a tap.** At most **50** words in view on any sheet, card or tip, and at most **20** words in one paragraph, row or button. A whole sheet holds at most **300** words when scrolled; more becomes tabs or detail screens. At most **2** levels below the map (a panel, then a detail). The one-primary limit is rule 14. Counted in the first viewport at 360px in both languages; numbers, icons and the player's own names are not words. List length is not capped. Why: adults read about 238 words a minute ([Brysbaert 2019](https://www.Gwern.net/doc/psychology/linguistics/2019-brysbaert.pdf)), people read about 20% of the words on a page ([NN/g](https://www.nngroup.com/articles/how-little-do-users-read/)), and "designs that go beyond 2 disclosure levels typically have low usability" ([NN/g](https://www.nngroup.com/articles/progressive-disclosure/)). Long lists are fine when items are recognisable ([NN/g](https://www.nngroup.com/articles/short-term-memory-and-web-usability/)). The 50 and 300 are judgement calls from reading speed. Known fails on 2026-10-31: Neighbours, the How-to card, Wacana, Stats and the Build tabs.

### Hierarchy

14. **Four roles, four looks.** The CSS classes are the source of truth. **Primary** (`.btn-primary`): filled accent, **1** per screen, the next step. **Secondary** (`.btn`, `.btn-secondary`): outline, no fill. **Choice** (`.btn-choice`, any `[aria-pressed]`, `.toggle`): accent border and underline when on, never the primary fill. **Input** (`.name-input`): light field with an inset border. Section labels and headings are plain text, never a box. A disabled button keeps its role's shape, muted, with a solid border, never dashed. Why: one fill for "go" and "selected" makes the two look alike, and a screen with several loud buttons has no obvious next step ([NN/g](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/)).
15. **One tab set holds one kind of thing.** Tabs show siblings of the same type, such as things to place. Collections and records (Combo book, Log, Stats) open from a header button, never as a tab. Why: the Combo tab in Build mixed "what can I place" with "what have I found".
16. **Pills, chips and buttons say it plainly in 6 words or fewer.** Lead with a verb or a plain label such as "Goal:", never a symbol or jargon such as "★ berikutnya, 2 target lagi". Numbers and icons are not words. Detail opens on tap. Why: the goal pill was cut and unclear.
17. **Map art stays in its footprint.** A building, crane, effect or shadow draws only over its own tiles and the space above them, never over neighbouring tiles or roads. Why: the crane drew a dark box over the road (#221).

### Hierarchy

14. **Four roles, four looks.** The CSS classes are the source of truth. **Primary** (`.btn-primary`): filled accent, **1** per screen, the next step. **Secondary** (`.btn`, `.btn-secondary`): outline, no fill. **Choice** (`.btn-choice`, any `[aria-pressed]`, `.toggle`): accent border and underline when on, never the primary fill. **Input** (`.name-input`): light field with an inset border. Section labels and headings are plain text, never a box. A disabled button keeps its role's shape, muted, with a solid border, never dashed. Why: one fill for "go" and "selected" makes the two look alike, and a screen with several loud buttons has no obvious next step ([NN/g](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/)).

## How each rule is checked

| Rules | Check |
| --- | --- |
| 1, 4, 5 | `npm run e2e` legibility scan, 4 widths. CI runs Indonesian; local runs add English. |
| 7, 8 | Word count over `src/i18n/en.ts` and the event data. Not automated. |
| 2, 3, 6, 9, 11 | Review against the audit crawl screenshots |
| 10 | e2e: at each tutorial step, tap outside the target and assert nothing changes. |
| 14 | Review against the CSS classes. e2e: max 1 visible `.btn-primary` per screen, to be added to the rule 13 scan in `ui.spec.ts`. |
| 15 | e2e: a list of each tab set and its item type; a tab with a different type fails. |
| 16 | e2e: word cap on pills, chips and buttons, and a tap opens detail. |
| 17 | Canvas test: place each building type and diff the neighbouring tiles before and after. |
| 12 | Timed run. Not automated. |
| 13 | Word counts per screen. Measure script in the project files (`plans/text-density-measure.spec.ts`); to be added to `ui.spec.ts`. |
| 14 | Review against the CSS classes. Max 1 visible `.btn-primary` is to be added to the rule 13 scan in `ui.spec.ts`. |
| Layout drift | Screenshot baselines (`tests/e2e/visual.spec.ts`): home, HUD, Build sheet, event popup, tip card. 412px, Indonesian. |

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

## Review checklist

Approved by Hari, 2026-10-31. The baseline agents use to judge whether the UI is good, not just unbroken. Each item quotes what good looks like from a published source, lists its sub-checks and sets a pass bar. See `decisions/ui-review-checklist.md`.

### How it relates to the rules

- **UI.md's 13 rules stay the floor.** A screen that fails them is a bug.
- **Part 1** gives six of those rules a bar a bot can check, with the source behind each.
- **Part 2** adds 23 items the floor misses.
- Items already in GAME-DESIGN.md section 8 are cross-referenced, not repeated: causes are legible (6), star rewards and NEW tags (12), coming back (27).
- **[PR]** = check on every PR that touches UI. **[Audit]** = run in the periodic full crawl.

### Evidence tiers

- **T1 Lint:** static checks over `src/i18n/`, `src/data/`, `src/ui/` and the CSS, in `npm test`.
- **T2 Playwright:** the real app at 320, 360, 412 and 430px, in id and en. Counts taps, times responses, reads the DOM and the canvas draw calls. Extends `tests/e2e/ui.spec.ts` and the audit crawl. The default throttle is the existing fps test's (6x CPU).
- **T3 Human:** advisory only. Never a pass bar.

### Sources quoted

| Tag | Source |
| --- | --- |
| **NN/g-H** | Nielsen Norman Group, [10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) |
| **NN/g-T** | Nielsen Norman Group, [Response Times: The 3 Important Limits](https://www.nngroup.com/articles/response-times-3-important-limits/) |
| **HIG-Games** | Apple HIG, [Designing for games](https://developer.apple.com/design/human-interface-guidelines/designing-for-games) |
| **HIG-Feedback** | Apple HIG, [Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback) |
| **HIG-Alerts** | Apple HIG, [Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts) |
| **HIG-Onboarding** | Apple HIG, [Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding) |
| **HIG-Launching** | Apple HIG, [Launching](https://developer.apple.com/design/human-interface-guidelines/launching) |
| **HIG-Layout** | Apple HIG, [Layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| **HIG-Motion** | Apple HIG, [Motion](https://developer.apple.com/design/human-interface-guidelines/motion) |
| **GAG** | [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/full-list/) |
| **XAG 101** | Microsoft, [Xbox Accessibility Guideline 101: Text display](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/101) |
| **WCAG** | W3C, [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) |
| **web.dev** | [INP](https://web.dev/articles/inp), [LCP](https://web.dev/articles/lcp) |
| **MDN** | [overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior), [touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) |
| **PG-Heropolis** | Pocket Gamer, [Legends of Heropolis review](https://www.pocketgamer.com/legends-of-heropolis/review) (a Kairosoft game) |
| **[DV] [GDS] [HSS] [MMS] [SM]** | Kairosoft wiki pages in `research/kairosoft-raw/` |

Kairosoft's wiki pages cover mechanics, not UI, and most Kairosoft games are landscape (DV, GDS: "landscape = yes"; HRH: "Landscape only"). So Kairosoft appears only where a source says something about UI.

---

### Part 1. Sharper bars for existing UI.md rules

#### Rule 1. Tap targets [PR]
> "buttons in iOS must be at least 44x44 pt to accommodate touch interaction." (HIG-Games; its table lists 28x28 pt as the iOS minimum)
- Our 48px default and 28px top-row exception both sit inside Apple's range.
- **Sub-checks:** every control in the dock, sheets, pop-ups, tips and the home screen. The 28px exception applies only to the two top rows and the goal pill.
- **Pass:** existing scan, plus a T1 list of every element using the 28px exception. Any new entry needs a `decisions/` note.

#### Rule 2. One home per feature [PR]
> "Users should not have to wonder whether different words, situations, or actions mean the same thing." (NN/g-H, Consistency and standards)
- **Sub-checks:** export the `ActionButton` registry. No panel reachable from two places. No feature reachable only from a toast.
- **Pass:** 0 duplicates, 0 toast-only features.

#### Rule 3. Primary action in the bottom third [PR]
- **Sub-checks:** the primary button of every sheet, pop-up, tip, SK card and the Lomba day. Measure its centre y at each width.
- **Pass:** centre in the bottom third of the viewport, never under the dock or a safe-area inset. Play and speed in the top row are the stated exception.

#### Rule 6. One icon, one meaning [PR]
> "Ensure no essential information is conveyed by a fixed colour alone" (GAG, Vision, Basic)
- **Sub-checks:** every resource or stat word in `src/i18n/` comes from a token such as {sabar}. Map badges carry a shape, not only a colour.
- **Pass:** 0 raw synonyms. 0 colour-only badges.

#### Rule 9. Unmet requirements say what is missing [PR]
> "Show people when a command can't be carried out and help them understand why." (HIG-Feedback)
> "Error messages should be expressed in plain language (no error codes), precisely indicate the problem," and suggest a fix. (NN/g-H, Recover from errors)
- **Sub-checks:** tap every disabled button on the RT, RW and Kelurahan dev seeds.
- **Pass:** a reason appears that names the missing amount or prerequisite ("Need Rp 200k more", "Needs 1★"). "Not available" fails.

#### Rule 11. Feedback ladder [Audit]
> "The most effective feedback tends to match the significance of the information to the way it's delivered." (HIG-Feedback)
> "Alerts can lose their impact if you use them too often or to deliver unimportant information." (HIG-Feedback)
- **Sub-checks:** a T1 table that maps every event type to one tier. **Pop** = routine income. **Toast** = information. **Card** = event, combo, decision. **Full screen** = star, SK, Lomba day, ending.
- **Pass:** every event type maps to exactly one tier. Only the four listed get full screen. Every tier closes in one tap.

#### Rule 12. Tap feedback within 100ms [Audit]
> "0.1 second is about the limit for having the user feel that the system is reacting instantaneously" (NN/g-T)
> "An INP below or at 200 milliseconds means a page has good responsiveness." (web.dev, measured at the 75th percentile in the field)
- **Sub-checks:** time from pointerdown to the first DOM change or canvas draw. 20 samples each for: dock button, sheet tab, build card, map tile, pop-up button, speed toggle.
- **Pass:** every sample under 100ms on the throttle profile. Unknown today.

---

### Part 2. New items

#### A. Reading the state

#### 1. Glance test [PR]
- **Ask:** can the player read date, Rupiah, goal and any alarm without a tap?
- **What good looks like:**
  > "The design should always keep users informed about what is going on, through appropriate feedback." (NN/g-H, Visibility of system status)
  > "Interfaces should not contain information that is irrelevant or rarely needed." (NN/g-H, Aesthetic and minimalist design)
  > "it often works well to display status information in a passive way so that people can view it when they need it." (HIG-Feedback)
- **Good here:** two slim rows plus a goal pill. An alarm (broke, preman, a meter falling) shows as a colour plus an icon on the number it hits.
- **Bad here:** state found only in a menu. Many numbers of equal weight.
- **Sub-checks:**
  - Date, Rupiah, goal pill and the 2045 meter are inside the viewport at all four widths, both languages, both themes.
  - Each readout's text is at least the rule 4 size.
  - The goal pill shows its whole first line, clamped only as UI.md rule 5 allows.
  - Each alarm state (Rupiah below 0, preman present, Sabar falling) puts an icon on the affected number.
- **Pass:** all sub-checks. No more than **9** readouts in the two top rows.

#### 2. Map shows state [Audit]
- **Ask:** does each building state read on the map without a tap?
- **What good looks like:**
  > "When status feedback is available near the items it describes, people get important information without having to take action or leave their current context." (HIG-Feedback)
- **Good here:** permit (stakes and sign), being built (scaffold and crane), mangkrak (scaffold, no crane), damaged, no road and unstaffed each have a distinct sprite or badge.
- **Bad here:** two states that look alike. Badges piled on a dense map.
- **Sub-checks:**
  - T1 table: state → sprite or badge id. All ids distinct.
  - T2 on the largest dev seed: bounding boxes of badge draw calls.
  - Each badge readable in night tint and in rain.
- **Pass:** every state has a distinct look. 0 overlapping badges.

#### 3. Numbers explain themselves [Audit]
- **Ask:** does tapping a HUD number show what moved it?
- **What good looks like:**
  > "Minimize the user's memory load by making elements, actions, and options visible." (NN/g-H, Recognition rather than recall)
- **Good here:** tap Sabar to see its name, this month's change and the top 3 causes with numbers.
- **Bad here:** a generic line such as "Many factors".
- **Sub-checks:** tap Rupiah, Sabar, Orang Dalam, Viral, Popularitas and the 2045 meter. The causes shown match the cause keys the sim logged for the last change.
- **Pass:** 100% of that list.

#### B. Finding things

#### 4. New things announce themselves [Audit]
- **Ask:** is each unlock flagged until the player has really looked at it?
- **What good looks like:**
  > "Feedback helps people know what's happening, discover what they can do next" (HIG-Feedback)
- **Good here:** NEW on the card, its tab and the dock. It clears when the card is tapped or has been in view for 1s.
- **Bad here:** no flag. A flag that never clears. A flag that clears just because the sheet opened.
- **Sub-checks:** for each unlock on the dev seeds: the tag on card, tab and dock; that it survives opening the sheet without looking; that it clears on a real view.
- **Pass:** 100% of unlocks.

#### C. Acting fast

#### 5. Tap counts [Audit]
- **Ask:** how many taps does each common task take, from the map with nothing open?
- **What good looks like:**
  > "Shortcuts — hidden from novice users — may speed up the interaction for the expert user." (NN/g-H, Flexibility and efficiency of use)
- **What bad looks like, in a Kairosoft game:**
  > "Navigating menus is a chore, and the number of steps required to do something as simple as levelling is frankly ridiculous." (PG-Heropolis)
  > "a confusing menu layout, which does a great job of hiding everything useful under a series of layers" (PG-Heropolis)
- **Sub-checks and bars** (every tap counts, tile taps included):
  - Build a house: **≤4** (Build, card, tile, Place).
  - Answer an event: **1**.
  - See why a meter fell: **≤2**.
  - Hire staff: set from the first measurement, then never rises.
  - Change speed: **1**.
  - Open the Combo book: **≤2**.
- **Pass:** each task at or under its count, at every width. Counter-bar: item 16's confirms are not removed to hit a count.

#### 6. Repeat without re-navigating [Audit]
- **Ask:** can the player place another of the same building without starting over?
- **What good looks like:** the same NN/g-H efficiency line as item 5.
- **Good here:** after Place, the same building stays picked until Cancel.
- **Bad here:** back to the map after every placement.
- **Sub-checks:** place 3 Rumah, 3 Jalan Setapak tiles and 3 Warung in a row.
- **Pass:** each extra copy ≤3 taps. Unknown today; verify first.

#### 7. Always a way out [PR]
- **Ask:** can every panel close in one tap, and does the phone's back gesture close the top panel?
- **What good looks like:**
  > "Users often perform actions by mistake." They need an obvious exit that doesn't require a lengthy process. (NN/g-H, User control and freedom)
- **Good here:** close in the same corner on every sheet. Back closes the top panel. On the bare map, back asks before leaving.
- **Bad here:** a modal that only closes by choosing, unless it is a decision.
- **Sub-checks:** every sheet, pop-up, tip, the Combo book, Warga list, Staff, Settings, Log. Close with the button, then with history back.
- **Pass:** 100%. **Known fail:** `src/` has no history handling, so back does not close panels today.

#### 8. Gestures and stray taps [PR]
- **Ask:** do map gestures fight the browser, or cause taps the player did not mean?
- **What good looks like:**
  > "You can use overscroll-behavior to get rid of unwanted scroll chaining and the browser's 'pull to refresh'-type behavior." (MDN)
  > `touch-action: manipulation`: "Enable panning and pinch zoom gestures, but disable additional non-standard gestures such as double-tap to zoom." (MDN)
  > "Avoid any sudden unexpected movement or events" (GAG, Cognitive, Advanced)
- **Good here:** pan and pinch go to the map. No double-tap zoom. A drag never counts as a tap.
- **Bad here:** pulling down on the map reloads the page and loses the month.
- **Sub-checks:** synthetic pull-down from the top of the map; double-tap on map and on a button; left-edge swipe; a drag that ends on a free tile; a tap 4px above the dock.
- **Pass:** no reload, no zoom, no navigation, no placement from a drag, no map tap through the dock.

#### 9. Safe areas and screen changes [PR]
- **Ask:** does the layout survive notches, home bars, rotation and the keyboard?
- **What good looks like:**
  > "Respecting the safe area is essential to make sure system UI and hardware features like the Dynamic Island don't obstruct content and controls." (HIG-Layout)
  > "If your interface only runs in one orientation, launch in that orientation and let people rotate the device if necessary." (HIG-Launching)
- **Good here:** dock and top rows sit inside the safe-area insets. Portrait lock, with a "turn your phone" card in landscape. The name field stays visible with the keyboard up.
- **Bad here:** the dock under the iPhone home bar.
- **Sub-checks:** emulate a 47px bottom and 59px top inset; a landscape viewport; focus the kampung-name field on New Game.
- **Pass:** no control inside an inset. Landscape shows the card. The focused field stays in view.

#### 10. Scrolling behaves [Audit]
- **Ask:** do long sheets scroll without moving the map, and keep their place?
- **What good looks like:**
  > "once the dialog box's scroll boundary is reached, the underlying page will then start to scroll — this is called scroll chaining." (MDN; the bad case)
  > "scroll the view to people's most recent position" (HIG-Launching, on restoring state)
- **Good here:** `overscroll-behavior: contain` on every sheet. Reopening a sheet returns to where it was, in one session.
- **Bad here:** reaching the end of the Warga list pans the map.
- **Sub-checks:** Build (each tab), Warga, Staff, Combo book, Log, How to play. Scroll past the end; check the map. Close and reopen; check the scroll.
- **Pass:** the map never moves. Scroll position kept.

#### 11. Time control is clear [PR]
- **Ask:** can the player always see the speed and pause from anywhere?
- **What good looks like:**
  > "Do not make precise timing essential to gameplay – offer alternatives, actions that can be carried out while paused" (GAG, Motor, Advanced)
- **Good here:** the active speed is highlighted. 1x and 2x only. Every sheet either pauses time or leaves pause reachable in one tap.
- **Bad here:** a sheet that hides the pause button while time runs.
- **Sub-checks:** open each sheet; check whether time runs; if it runs, find the pause control.
- **Pass:** 100%.

#### D. Feedback

#### 12. Consequence shows where it happens [Audit]
- **Ask:** when a building earns or costs, does a number appear over it?
- **What good looks like:**
  > "when a game displays a succinct animation that's precisely tied to a successful action, players can instantly get the message without being distracted from their gameplay." (HIG-Motion)
- **Good here:** a coin pop over the building that earned, at most one per building per second.
- **Bad here:** money changes only in the top bar. Or a blizzard of tiny pops.
- **Sub-checks:** per-building income events in the timeline against pops drawn over that building, with effects on. Cost pop on every placement.
- **Pass:** ≥90% of per-building income events get a pop. Never over 1 pop per building per second.

#### 13. Interruptions are rare and safe [PR]
- **Ask:** do pop-ups wait for a good moment and never stack?
- **What good looks like:**
  > "Use alerts sparingly." (HIG-Alerts)
  > "Avoid using an alert merely to provide information." (HIG-Alerts)
  > "Avoid showing an alert when your app starts." (HIG-Alerts)
  > Section 3 target 6: "At most 2 popups per minute, never two within 20s."
- **Good here:** pop-ups queue, never during placement, and the game pauses under them. Information goes to toasts and the Log, not cards.
- **Bad here:** a card that lands while the player drags a ghost. A card on Continue before the map shows.
- **Sub-checks:** force an event in build mode; force two events in one month; reopen a save with a queued event; count toasts per minute over the first 15 minutes.
- **Pass:** 0 pop-ups during placement. Target 6 holds in game time. 0 cards before the map is visible on Continue. At most 4 toasts a minute. Counter-bar: section 3 target 5 (novelty) still holds.

#### 14. Drag follows the finger [Audit]
- **Ask:** does the ghost track the finger smoothly while placing?
- **What good looks like:**
  > "Strive for realistic feedback motion that follows people's gestures and expectations." (HIG-Motion)
- **Good here:** the ghost moves every frame under the finger and snaps to tiles.
- **Bad here:** the ghost jumps tile to tile late.
- **Sub-checks:** synthetic 1s drag across 8 tiles on the throttle profile, at RT and Kelurahan.
- **Pass:** the ghost redraws within 2 frames of each pointer move.

#### E. Learning

#### 15. Teach at the moment of need [Audit]
- **Ask:** does each system get one short lesson when it first becomes usable, and not before?
- **What good looks like:**
  > "Teach through interactivity. People tend to grasp and retain information better when they can actually perform the task they're learning about" (HIG-Onboarding)
  > "Consider providing a collection of context-specific tips instead of a single onboarding flow." (HIG-Onboarding)
  > "if you try to teach too much, people can feel overwhelmed and may be less likely to remember what they learned." (HIG-Onboarding)
  > "Include interactive tutorials" (GAG, Cognitive, Basic)
- **Kairosoft:** the in-game manual is 30 pages [DV manual]. The secretary stops an action that makes no sense yet and says why: "There's no point in advertising until you've released a game" [GDS].
- **Good here:** one tip per system, 20 words or fewer, at least 60s apart, shown near the control it names. A How to Play page for each, to look up later.
- **Bad here:** a wall of tips at the start. A system with no tip.
- **Sub-checks:** T1 list of systems → tip → How to Play page. T2 timeline: "usable" means first unlocked and affordable; the tip fires within 60s of it. Each tip's anchor is on screen and not covered (rule 10).
- **Pass:** every system has both. 0 tips before usable. Rule 7 and section 3 target 7 hold.

#### F. Safety

#### 16. Confirm only what hurts [PR]
- **Ask:** do costly or irreversible actions confirm, and nothing else?
- **What good looks like:**
  > "Warn people when they initiate a task that can cause data loss that's unexpected and irreversible. In contrast, don't warn people when data loss is the expected result of their action." (HIG-Feedback)
  > "Avoid displaying alerts for common, undoable actions, even when they're destructive." (HIG-Alerts)
  > "If there's a destructive action, include a Cancel button to give people a clear, safe way to avoid the action." (HIG-Alerts)
  > "the best designs carefully prevent problems from occurring in the first place." (NN/g-H, Error prevention)
- **Good here:** confirm demolish, fire staff, decline SK, New Game over a save, and any spend over 25% of cash or of Orang Dalam. Button labels name the action ("Pecat", "Bongkar"), never "OK".
- **Bad here:** a confirm on every build. No confirm on firing a 4★.
- **Sub-checks:** T1 list of actions with a confirm, compared with the rule. Each confirm has a Cancel and an action-named button.
- **Pass:** the lists match exactly. 0 "OK" buttons on confirms.

#### 17. Mistakes can be fixed [Audit]
- **Ask:** can a misplaced building be moved?
- **What good looks like:**
  > They need an obvious exit from unwanted actions that doesn't require a lengthy process. (NN/g-H, User control and freedom)
- **Kairosoft:** Rearrange moves buildings for 300G and unlocks at 1★ [DV].
- **Good here:** every building can be moved, any time. Exemptions are listed (for example a plot waiting for a permit).
- **Bad here:** a misplaced Warung that has to be demolished at a full loss.
- **Sub-checks:** place, then move, each building type and a Jalan Setapak tile.
- **Pass:** every type except listed exemptions. `moveBuilding` exists; paths and permit plots are untested.

#### G. The phone

#### 18. Start and resume [Audit]
- **Ask:** how fast is the player back on the map, cold and warm?
- **What good looks like:**
  > "Launch instantly. People want to start interacting with your app or game right away, and sometimes they don't want to wait more than a couple of seconds." (HIG-Launching)
  > "Restore the previous state when your app restarts so people can continue where they left off." (HIG-Launching)
  > "Provide an autosave feature" (GAG, General, Intermediate)
  > "sites should strive to have Largest Contentful Paint of 2.5 seconds or less." (web.dev)
- **Kairosoft (bad):** Hot Springs Story sends you to the main menu on exit, so "remember to save first to be safe" [HSS].
- **Good here:** autosave. Home screen fast on a cold start. Continue lands on the map with the goal pill.
- **Bad here:** lost progress. A long blank screen.
- **Sub-checks:** cold start with an empty cache; warm start with a primed cache; kill the tab mid-month, reopen, compare the save.
- **Pass:** no progress lost beyond the current month. Cold start to home ≤2.5s. Continue to map with goal ≤2s.

#### 19. Smooth at the biggest stage [Audit]
- **Ask:** does the map stay smooth on a cheap phone at the Kelurahan?
- **What good looks like:**
  > "In most games, maintaining a consistent frame rate of 30 to 60 fps typically results in a smooth, visually appealing experience." (HIG-Motion)
- **Kairosoft (bad):** Station Manager "may crash, force close, or not run smooth on older devices" after an engine change [SM].
- **Good here:** steady frame rate while panning the full map with effects on.
- **Bad here:** frame drops on every pan.
- **Sub-checks:** the existing ratio test (6x throttle) stays. Add an absolute measurement on the largest dev seed, effects on, panning and idle.
- **Pass:** ratio test holds. ≥30 fps at 6x throttle. Unknown today; measure first.

#### 20. Works with everything off [Audit]
- **Ask:** is the game fully playable with sound, effects, motion and haptics off?
- **What good looks like:**
  > "Ensure no essential information is conveyed by sounds alone" (GAG, Hearing, Basic)
  > "Provide an option to turn off / hide background movement" (GAG, Cognitive, Intermediate)
  > "Make motion optional. Not everyone can or wants to experience the motion in your app or game" (HIG-Motion)
  > "when you provide feedback using color, text, sound, and haptics, people can receive it whether they silence their device, look away from the screen, or use VoiceOver." (HIG-Feedback)
- **Good here:** every sound cue has a visual twin. Reduce motion stops ambient motion, not feedback.
- **Bad here:** a cue that only plays as sound.
- **Sub-checks:** T1 registry: every sound id maps to a visual cue. T2: the first-15-minute bot script with all toggles off, same seed.
- **Pass:** 0 sounds without a twin. The same goals are reached within 10% of the time.

#### 21. Text size and contrast settings [Audit]
- **Ask:** does the UI hold up at a larger OS text size and in high contrast?
- **What good looks like:**
  > "text can be resized without assistive technology up to 200 percent without loss of content or functionality." (WCAG 1.4.4)
  > "Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions" at "a width equivalent to 320 CSS pixels" (WCAG 1.4.10)
  > "Allow the font size to be adjusted" (GAG, Vision, Advanced)
  > "Platform-provided screen magnification tools aren't an appropriate mitigation for small text size." (XAG 101)
- **Good here:** layout reflows at a larger text size with no clipping and no sideways scroll.
- **Bad here:** labels cut off at a larger font.
- **Sub-checks:** legibility scan at 130% and 200% root font size, at 320px, and with high contrast on.
- **Pass:** at 130%, rules 4 and 5 pass. At 200%, no sideways scroll and no lost controls (clamping allowed). High contrast passes rule 4.

#### 22. Offline and updates [Audit]
- **Ask:** does the game run offline after the first load, and does an update never lose play?
- **What good looks like:**
  > "If your app detects a problem at startup, like no network connection, consider alternative ways to let people know. For example, you could show cached or placeholder data and a nonintrusive label" (HIG-Alerts)
  > "Ensure that all settings are saved/remembered" (GAG, General, Basic)
- **Good here:** plays offline. An update waits behind the home-screen button or the Menu dot (section 6) and saves first.
- **Bad here:** a blank screen offline. An update that reloads mid-month.
- **Sub-checks:** cut the network after first load and reload; simulate a waiting service worker during play; check settings survive a reload.
- **Pass:** plays offline. 0 reloads during play. Save before every update reload. All settings kept.

#### 23. Both languages are equal [PR]
- **Ask:** is every screen complete and in one language, in both id and en?
- **What good looks like:**
  > "The design should speak the users' language." (NN/g-H, Match between system and the real world)
  > "Use simple clear language" (GAG, Cognitive, Basic)
  > "Ensure that all fonts include complete character sets for all supported languages." (XAG 101)
- **Kairosoft (bad):** Mega Mall Story's English version left at least one Japanese word in place [MMS].
- **Good here:** every key in both. No mixed language, except an allowlist of loanwords used on purpose (Rupiah, warga, SK, Lomba, RT, RW).
- **Bad here:** a missing key that falls back to the other language.
- **Sub-checks:** T1 key parity (`i18n.test.ts`); a mixed-language lint with the allowlist; T2 scan in both languages.
- **Pass:** 0 missing keys. 0 lint hits.

### T3 human check (advisory, 5 minutes)

- 5-second test on the main screen: "What is your goal? Are you in trouble?"
- First-click test: build a house, hire staff, see why Sabar fell, find the Combo book, change language.
- "What did you tap expecting something, and get nothing?"

### Known fails and unknowns today

- Fail: item 7 (no back handling).
- Unknown until measured: rule 12 timing, items 5 (hire), 6, 14, 18, 19, 21 at 200%.
- To verify: item 17 for paths and permit plots.
