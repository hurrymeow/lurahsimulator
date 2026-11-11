# TODO

Open tasks and ideas that are not done yet. Each item has a Problem, a Why and a Suggested solution, then a claim line: `[ ] status · owner · claimed date · done when`. Write all four when you add an item, so the next agent needs no context. To claim one, set status to `claimed`, add your name as owner and today's date, then open a PR. When it merges, move the item to Done. Add any open work you find or leave behind. Shipped work goes in `progress/`, decisions in `decisions/`.

## Tasks

**Approval (2026-11-02):** TODO items wait on no one. The agent that claims an item judges the work against GAME-DESIGN.md §8, the UI.md review checklist and TESTING.md, and approves it itself. A bot run, a nightly scorecard and CI count as the playtest. Record the verdict in `decisions/`. Ask the repo owner only for what needs their hands: credentials and secrets, GitHub or repo settings, spending money, and irreversible actions such as deleting data or rewriting main.

Ranked 2026-11-01: Now, Next, Later, top first within a tier. Rank by player pain, then unblock value, then cost.

### Now

- [ ] **Kecamatan starts with households that have no food.**
  - Problem: the hint path promotes with about 460 residents and food for 50 of 154 households, so pinjol sits at 55 to 71% and no Kecamatan star comes.
  - Why: `decisions/playtest-bot-gaps.md` finding 2 (Hari, 2026-11-09: fold into tuning).
  - Suggested solution: tune with the Wacana/Staf T6 pass (`docs/plans/wacana-staff-core.md`).
  - Taken over 2026-11-11 by the daily sweep: the 2026-11-09 claim had no PR or commit after 2 days.
  - `claimed · Claude (sweep) · 2026-11-11 · done when:` 10 of 10 hint-path seeds earn Kecamatan 1★ in the Nightly.

### Next

### Later

- [ ] **Build Pak Camat's board of side goals.**
  - Problem: the plan is on main (`docs/plans/camat-board.md`, #406) but nothing is built. Between stars the open goal lines move slowly, and Staf and Wacana have no short-term pull.
  - Why: joofoot asked for it (2026-11-09); it aims at scorecard rows 7 (goal gaps), 13 (Orang Inside unspent) and 14 (cash piles up).
  - T1 (board state and pool in the sim) is merged: #408, `decisions/camat-board-T1.md`.
  - Suggested solution: tasks T2 to T4 of the plan: the Menu row and sheet, the bots claiming goals, then the docs. Defaults for the three open questions are in the plan.
  - `open · — · — · done when:` T1 to T4 are merged and the T3 bot bars are recorded in decisions/.

- [ ] **Sejahtera, the Kerja meter and Indonesia Emas change almost nothing.**
  - Problem: Sejahtera and Kerja feed only the 2045 meter and a drop toast, so a Realisasi that moves Kerja does nothing. Emas adds a point or two to the ranking, against 8 for each resident. The 2045 ending that reads Sejahtera is not built.
  - Why: the core satire is Laporan against Sejahtera. If doing it for real pays nothing, players only learn to announce.
  - Suggested solution: decide what a good Sejahtera buys before the ending exists. Options include the share of iuran paid, resident arrivals, or a yearly SK bonus. Prove it with the honest and pencitraan bots. Source: `docs/plans/wacana-staff-core.md`, open questions.
  - `open · — · — · done when:` raising Sejahtera changes a star time for the honest bot, or a decisions file says why not.

- [ ] **Stars still follow time in the stage, not how well the player plays.**
  - Problem: since #376 tier-win goals count every quarterly ranking and no star lands on the same week for every bot, but every climbing bot still wins about 84 of 86 Kelurahan rankings (`decisions/wacana-staff-core-T6.md`). So RW 3★ and Kel 3★ come a set number of quarters after promotion, and a builder that never hires reaches them on the same weeks (Wacana and Staf T6 bar 5 fails). The RW is 13 to 16 min (target about 20) because RW 1★ comes within a minute of promotion; the Kelurahan is 22 to 26 min (target about 30).
  - Why: GAME-DESIGN.md §8 items 4 and 10, and T6 bar 5: staff and play should move a star.
  - Suggested solution: make the ranking close for a good player, for example a rival that tracks the player's own area score from the quarter they arrive, or a goal that skill moves (a score margin, Sejahtera) beside the win count. Make RW 1★ ask for more than three builds in Kampung Sebelah. Rerun the no-hire builder (T6 bar 5) and the nine player types against main. Also probe whether a big, fully housed kampung can sink under the Kel 3★ Popularitas bar in real play (`decisions/stage-lengths-quarterly-wins.md`, Not changed).
  - Source: `decisions/stage-lengths-quarterly-wins.md`; `decisions/wacana-staff-core-T6.md`, Follow-ups
  - `open · — · — · done when:` the no-hire builder reaches RW 3★ and Kel 3★ at least 15% later than the hiring one, and the RW is inside its length band or a decisions file says why not.

- [ ] **Run the scorecard bots with the road rule on.**
  - Problem: `tests/setup.ts` turns the road rule off for every test, the scorecard included. Bot buildings work without a path, so bots have more room than a player and the numbers flatter the game.
  - Why: the scorecard judges balance for real play.
  - Suggested solution: turn the rule on for the scorecard runs (`tests/scorecard/`), teach the driver to lay a path when a spot has none, and compare the nine player types before and after.
  - Source: `decisions/smaller-map-T9.md`, note 4; `decisions/smaller-map-balance.md`
  - `open · — · — · done when:` the scorecard runs with the road rule on and its numbers are refreshed.

- [ ] **Scorecard row 27: the goal's progress is a tap away.**
  - Problem: row 27 reads Fail since #356. GAME-DESIGN.md §8 item 27 asks for "current goal and its progress on screen within 5s". `decisions/goal-line-one-goal.md` keeps have and need off the closed goal pill, so after a reload the goal shows but its progress needs a tap.
  - Why: the bar and the pill decision disagree, so the row cannot pass without changing one of them.
  - Suggested solution: decide which changes. Either show a short progress (for example "12/25") on the closed pill if it fits without cutting the line (UI.md rule 5), or reword the §8 bar to "progress one tap away" with a decisions/ note. The T2 spec records `progress-on-screen`, so the row flips to Pass by itself if the pill shows progress.
  - Source: `decisions/scorecard-t2-harness.md`; `decisions/goal-line-one-goal.md`
  - `open · — · — · done when:` row 27 reads Pass, or the §8 bar is reworded with a decisions/ note.

- [ ] **Fix the remaining scorecard Fails that have a clear cause.**
  - Problem: the scorecard of 2026-11-04 reads 3 Pass, 14 Fail, 10 Unknown. Still failing with a cause: Viral pinned at 100 from B2 on (5, claimed: #319 adds a soft cap; B0 and B1 sit at 0 before any Viral source), goal gaps over the band (7, 10), novelty gaps (11), one reward kind per star (12), cash piles up for up to 52 min with no late sink (14), income outruns costs (15), Pencitraan never reaching Kel 1★ (17), Hint reader finds only 41% of combos (21, bar 65 to 85%). Kelurahan 2★ and 3★ still miss the goal-gap limit by 40 to 136 s (`decisions/second-rt-load.md`, cause not traced).
  - Why: each Fail is a place the game is too easy, too flat or can strand a player.
  - Suggested solution: one small PR per row, each proved by a Nightly rerun. Cash sink and late Popularitas sources are content, so check them against the Act 2 plan first.
  - Source: `scorecard/scorecard.md`; `decisions/rt-3star-pace.md`; `decisions/combo-stack-cap.md`; `decisions/cheapskate-bar.md`
  - `open · — · — · done when:` each balance row passes or has a stated reason in decisions/.

- [ ] **Finish the scorecard: the 10 Unknown rows and the bot gaps.**
  - #311 linted traits and combos (item 2, now Pass) and added Dana, Stempel and Anggaran to the timeline (item 13).
  - Problem: the scorecard (`scorecard/scorecard.md`) still has 10 Unknown rows. Missing: goal ETAs (item 8), the screen checks (3, 27, T2), ablation runs (16), warning lead of fixed beats (22: decide first which beats count as warned, such as the Lomba announcement card), a worst-event chain (23), the cause shown on screen (6). The hint bot stalls at 1★ because the combo pointer fires late.
  - Why: section 8 stays partly blind until each row can be judged. The nightly run is also untested on GitHub.
  - Suggested solution: add goal ETAs to the recorder, a forced event chain and per-action ablation runs. Add T2 specs for items 3, 6 and 27. Check the first nightly run time (bar 20 min) and trim seeds if needed.
  - Source: `scorecard/scorecard.md`; `decisions/scorecard-harness.md`
  - `open · — · — · done when:` no row reads Unknown for a reason the harness could fix, and a nightly run finishes under 20 minutes.

- [ ] **Scorecard bots: the last RT stalls.**
  - #313 fixed two combo loops in the bots (a leveled combo piece and an uncapped copy fallback); the builder now misses RT 3★ in 1 seed of 10, not 8. The 2nd RT was not the cause.
  - Problem: item 1 still waits 192s with nothing affordable (bar 60s; in #303 the longest waits were at the Kecamatan, for a building of Rp 171jt to Rp 250jt), RT 2★ is late in 10 of 10 seeds, and the Pencitraan bot never reaches RT 2★ (item 17).
  - Why: the scorecard cannot judge pace or strategy balance while bots stall.
  - Seed 4 RT 3★ is fixed (#348, `decisions/last-rt-stall-bot.md`): a bot gap, not balance. All five main bots now reach RT 3★ on 10 of 10 seeds. Open question from it: when the RT is full, what does the Popularitas goal tell a person to do? (Swap a Sawah for a Pos Ronda.)
  - The Pencitraan stall is a strategy collapse on slow-growth seeds, not a bot bug (`decisions/scorecard-pencitraan-probe.md`); fixing it is a balance call that belongs with the scorecard Fails item.
  - Suggested solution: probe the 208s wait and the late RT 2★ the same way (state and building counts at the stall) and tell a bot bug from a balance gap.
  - Source: `decisions/scorecard-bot-combo-loop.md`
  - `open · — · — · done when:` the builder reaches RT 3★ in 10 of 10 seeds, and item 1 is under 60s or has a recorded balance reason.

- [ ] **Scorecard follow-ups from the 2026-11-07 calls.**
  - Problem: three things the calls left open (`decisions/scorecard-calls.md`). 1) Row 22 now Fails: the Lomba Agustusan returns every 6.4 min, bar 10 min. 2) Rows 3, 6, 27 need one Playwright slice (sprites per star, cause shown on screen, save and reload at 5s in both languages). 3) Row 13: builder bots never spend Orang Dalam (B1, B4) and Stempel is never earned in B4.
  - Why: they turn three rows from Unknown or Fail into a real verdict.
  - Suggested solution: 1) Done: the Lomba is held every second year (#361; `decisions/lomba-every-second-year-T1.md`). Follow-up: `agustusan()` bunting still shows every year; gate it on the lomba year, and check row 22 on the next Nightly. 2) Done: specs in #350, harness reads them in #356 (row 3 Pass, row 6 Pass, row 27 Fail). 3) Teach the builder bot to spend Orang Dalam on the quarterly visit.
  - Source: `decisions/scorecard-calls.md`
  - `open · — · — · done when:` row 22 reads Pass or Fail on the next Nightly, the bunting follows the lomba year, and row 13 has no bot-gap line. (Rows 3, 6 and 27 done in #356.)

## Done

- [x] **Secondary goals board from Pak Camat (Kairosoft style): the plan.** Three side goals at a time from RT 1★, one new each quarter, small sure rewards, never gating a star; one Menu row and one sheet. Building it is the item above. #406, `docs/plans/camat-board.md`, `decisions/camat-board-plan.md`.
- [x] **Build Decor one by one without leaving build mode (owner request).** Decor stays in hand after each one goes up: tap, confirm, the next, until ✕. A first try put Decor in rows (#399); the owner wanted one by one, so rows stay for paths only (#404). `decisions/decor-keep-placing.md`.
- [x] **Stage lengths, and stars that wait on the yearly ranking.** Tier-win goals count every quarterly ranking; the March audit moves to Kel 3★; the RW and Kelurahan rivals are stronger and grow with the quarters in the stage, capped at 16. No star lands on the same week for every bot, and Act 1 ends at 50 to 55 min (was 38). Stars still follow time in the stage: narrowed into the item above. #376, `decisions/stage-lengths-quarterly-wins.md`.
- [x] **A refused personal request no longer reads as a refused raise (owner request).** The staff card, chip and poach notice name what was refused; a Baperan quits at 25%, 50%, 75%, then always, instead of every time. #380, `decisions/staff-refusals.md`.
- [x] **Show where a combo piece goes.** While a combo's missing piece is in hand, free tiles beside its partner tint gold. #402, #403, `docs/plans/combo-join-highlight.md`.

- [x] **Tune Wacana and Staf with the Nightly scorecard (plan T6).** Five bots on 6 seeds, before T2 against main. Bars 1, 2 and 4 pass. Bar 5 fails: the quarterly ranking calendar sets the RW and Kelurahan 3★ weeks for every bot, so even 5 to 8 times the permit time leaves a no-hire builder on the same quarter. No constant changed. Bar 5 moves to the stage-lengths item. `decisions/wacana-staff-core-T6.md`.
- [x] **Finish the Kelurahan and Kecamatan sprite pass (follow-up to #383).** Julian's review turned the plate font into a rule: an icon, never a word (only names as short as RT or RW are lettered). Pictogram plates (Pasar basket, Terminal bus, RSUD red cross) face the street flat; Pos Satpol PP has a red and blue rotator; blinking lights through a new `blink` list on sprite art; Kantor Kelurahan in dark green with a teras; Kolam Lele level 1 grounded. Then Taman level 3 with one thing per quarter, Aspal Ulang with a road roller, Baliho with a ladder and a tukang pasang, and an overlap check of every RW, Kelurahan and Kecamatan sprite. Studi Banding was already redrawn in #390. #395, #396, `decisions/icons-not-words.md`, `decisions/kel-kec-pass-finish.md`.
- [x] **Staff and Wacana matter (T1 to T5).** Bots hire an Asisten on a wage-aware budget; programs count in the quarterly ranking; every Wacana and Realisasi has a PIC (Gaul, Rajin, Jujur) you can change in the pop-up; permit folders grow with the stage. DeepSeek executor, #387, #388, #391, #393, #394, `docs/plans/wacana-staff-core.md`. T6 tuning stays open below.
- [x] **Shops give jobs, and earn less short-staffed.** Penjaga Toko, Tukang Masak and Tukang Cukur, 1 to 3 posts a shop; a short-staffed shop earns up to 25% less. Late idle share fell from about 0.5 to about 0.3 for the bots; RW 2★/3★ come 0 to 11 weeks later. GAME-DESIGN.md §4. #374, `decisions/shop-jobs.md`.
- [x] **Playtest the smaller map from RT 3★ to Kelurahan 3★ (T9).** The agent's verdict: playable end to end; every climbing bot reaches Kelurahan 3★ on every seed, and the Kecamatan bot reaches 3★ in 57 min. The Aman goal now names the preman fix. Pacing and the road rule are new items above. #358, `decisions/smaller-map-T9.md`.
- [x] **The scorecard harness reads the T2 specs (scorecard follow-ups, part 2).** `npm run scorecard:t2` runs `tests/e2e/scorecard-t2.spec.ts` at 412px in id and en into the scorecard cache, and a new nightly job runs it. Rows 3, 6 and 27 now read Pass, Pass and Fail instead of Unknown. The row 6 spec no longer flakes on a pending event. #356, `decisions/scorecard-t2-harness.md`.
- [x] **Visual baselines no longer flip with runner speed.** `page.clock.install` kept time running in real time, so the welcome toast was in or out of the HUD, event and tip shots depending on load. `visual.spec.ts` now pauses the clock after load, so only `settle` moves time. Passed CI first time with no baseline refresh; since then the baselines have failed only on PRs that changed the screen, the same on every retry. #281, `progress/visual-clock-pause.md`.
- [x] **Low and wide 2x2 art, and native-size cranes on big sites.** `Painter.low()` keeps heights native on big lots: 15 big buildings stand no taller than a 1x1 and read wide; stakes and scaffold keep 1px lines on any lot (the crane went in #256). `tests/art.test.ts` checks both. #343, `decisions/wide-2x2-art.md`.
- [x] **The hint reader is no longer the slowest way through the RW.** It never built Balai RW though the RW combo step names it. Fixed in the bot; hint now reaches RW 2★ level with the builder on seeds 1 to 6. #341, `decisions/hint-bot-balai-rw.md`.

- [x] **Icons instead of text in build placement and Settings.** Placement bar uses ✕ ↻ ✓ with the word as aria-label (#334); Settings loses 8 help lines and its word cap drops from 65 to 35 (#335). Both ran on the DeepSeek executor. Touch phones show no title text, so the help is for screen readers only.
- [x] **WebKit: Balap Karung's tap button detaches on every tap.** The race ended on its 5-second timer before WebKit's slower clicks finished; the test now taps until the race ends. The WebKit nightly of 2026-11-07 (run 42316657428) passes in full. #320, `decisions/webkit-lomba-mash.md`.
- [x] **The SK is a ceremony.** The card names the new post and accepts it; while it waits, the goal pill brings it back. #336, `decisions/sk-ceremony-combo-upgrade.md`.
- [x] **Sayur Segar lights up when its Warung is upgraded.** The upgrade button runs the combo check, so any combo that needs a level shows its card at once. #336.
- [x] **Kelurahan residents goals barely bite.** Kept on purpose: the goal is a floor, the stage's work is Popularitas under growth, and 200 is tied to the taper and the Kecamatan's 250. `decisions/kel-residents-goals.md`.
- [x] **WebKit: the yearly report card never shows.** A test race, not a game bug: WebKit opens the tip or event card a frame later, so the test's loop never reached the quarter end. Loop rewritten; passes in Chromium and WebKit. #333, `decisions/webkit-report-card.md`.
- [x] **Full UI re-audit (T11).** The crawl is in the repo (`npm run audit:ui`); every screen passes at 4 widths, 2 languages and 2 themes apart from the allowlisted Settings and Warga. Fixed the 17 Agustus panel, the Kecamatan's Wacana and Neighbours, and dark-theme stat icons. #329, `decisions/ui-reaudit.md`.
- [x] **English event bodies over 20 words.** `tests/event-words.test.ts` checks every event body and choice in both languages; four English lines cut. #329.
- [x] **The 2nd RT, T7.** Judged on screen from RT 3★ to Kelurahan 1★; English singular for goal lines. #322, `decisions/second-rt-T7.md`.
- [x] **The Kampung Sebelah stars goal names a next build.** "build Rumah in Kampung Sebelah" when it is short of warga, else its first unmet goal. #326, `decisions/sebelah-step-hint-bot.md`.
- [x] **Agent playtest of the Kelurahan.** The report's income no longer reads as a loss; the tier-win goal says "yearly" and each ranking card says if it counts. #327, `decisions/playtest-kel.md`.
- [x] **Make staffing integral: the permit desk queue.** Shipped as #200, fixed for the weekly calendar after; the claim was never closed. `decisions/desk-queue.md`, `decisions/desk-queue-weeks.md`.
- [x] **The 2nd RT, T1 to T6.** Kampung Sebelah is the player's from the RW (#303); its tutorial (#306); the AI RT tutorial at RW 2 (#316); a 24-week Serapan line for Kelurahan 1★ (#317). T7 stays open above. `decisions/second-rt.md`, `decisions/second-rt-T6.md`, `decisions/second-rt-load.md`.
- [x] **WebKit: frame-rate bars.** Skipped in WebKit, where CI renders in software; Chromium keeps the check. #315, `decisions/webkit-first-run.md`.

- [x] **Scorecard bots: two combo loops fixed.** The builder bought a Rumah Makan or Wifi every week chasing a combo; RT 3★ missed by 1 seed of 10, was 8. #313, `decisions/scorecard-bot-combo-loop.md`.
- [x] **Scorecard: traits and combos linted, Dana, Stempel and Anggaran tracked.** Items 2 and 13; scorecard refreshed. #311, `decisions/scorecard-lint-sinks.md`.
- [x] **Every sprite inside its footprint.** The last nine props moved in; `SPILL_ALLOW` is empty. #309, `decisions/sprite-props.md`.
- [x] **Quest chains for every special.** The other eleven, with Bro Kripto's and Om Motivasi's gambles on Jujur. #309, `decisions/special-chains-four.md`, `decisions/special-chains-last-seven.md`.
- [x] **Urusan Pribadi: the rest.** Experience asks as promises, the 3-heart perk, loans that open a warung. #309, `decisions/urusan-pribadi-rest.md`.
- [x] **CI: a layout-shift canary, and the first WebKit nightly.** The canary in `visual.spec.ts`; two CDP tests skipped outside Chromium; three WebKit failures logged above. #309, `decisions/layout-shift-canary.md`, `decisions/webkit-first-run.md`.
- [x] **CI: console guard, canaries, WebKit and property tests nightly.** #308, `decisions/ci-guard-canaries-webkit.md`.
- [x] **Urusan Pribadi (first slice).** From level 2, staff ask for cuti, a loan, a course or a resource about every 24 weeks; Akrab hearts (+3 work each); loans come back on Jujur. #305, `decisions/urusan-pribadi.md`.
- [x] **Quest chains (framework and the linked pair).** Pak Purna's memoir needs Bu Juru Ketik; her typewriter needs Bang Rental PS and doubles her desk. #305, `decisions/special-chains.md`.
- [x] **Painter bugs behind most footprint spills.** Half-pixel rows and long-footprint ground; spilling sprites 31 to 9. #304, `decisions/sprite-footprints.md`.
- [x] **NEW tags that clear only when the card has really been seen.** 2s at least half on screen, or a tap; tab and dock badges stay while anything is unseen. #300, `decisions/new-tags-seen.md`.
- [x] **Show which RW and RT is yours and which the AI runs on the map.** Nameplates ("RT 1 · Yours", "RT 4 · RW 2 · AI"); the own-RW limit went with #297. #299, `decisions/map-owners.md`.
- [x] **Make the path to RW 2★ clear.** The neighbour goals name Dana, Kunjungan and building on the RT; UI.md checklist item 24 "Every goal says how". #299, `decisions/rw2-clear.md`.
- [x] **CI: flaky tests in the run summary, English on string changes.** #299, `decisions/ci-flaky-english.md`.
- [x] **HIGH PRIORITY: Let the player build on AI-run RTs, and add Kunjungan (visit) as a one-tap boost.** RT buildings on an AI RT's free lots count for it; Kunjungan (1 Orang Dalam, once a quarter) builds now and adds 3 warga; Go to RT; takeover retired. #297, `decisions/build-on-ai-rts.md`.
- [x] **A portrait for every staff member.** Each role's outfit, a face seeded by the staff id, on the card, the detail view and the applicant card. #297, `decisions/staff-portraits-all.md`.
- [x] **The yearly price banner.** From year 2, a card with the rise and one of 12 reasons, never the same twice in a row. #296, `decisions/price-banner.md`.
- [x] **Pixel "2" (and "5").** Redrawn so "T2" and "2045" read right. #296, `decisions/pixel-two-five.md`.
- [x] **The combo goal fits the pill.** The pill names the combo; its buildings move to the opened goal list. #296, `decisions/combo-goal-pill.md`.
- [x] **CI checks for UI rules 10, 15, 16 and 17.** Tutorial lock steps, `tab sets`, label words, `footprint-art.test.ts`. The re-audit stays open above. #295, `decisions/ui-rule-checks.md`.
- [x] **Centre button and bar text vertically.** UI.md rule 18, the `vertical centring` e2e check; promotion buttons, goal pill and the dice button fixed. #292, `decisions/vcenter.md`.
- [x] **Show a how-to hint for every goal when it is tapped open.** `GOAL_HOW` for all 22 goal kinds; one line at a time in the opened list. #292, `decisions/goal-how-hints.md`.
- [x] **Stop a big kampung getting stuck under the Kelurahan 3★ Popularitas bar.** Expectations taper past 200 residents; a warga with no bed moves next door. All three bot seeds reach 3★. #292, `decisions/big-kampung-taper.md`.
- [x] **Cut text on the Build cards (UI rule 13), and bring the English Warga list back under its cap.** One line per card with an info button; shorter English hint. Density test checked at 320, 412 and 430px in EN and 320 and 430px in ID. #289, `decisions/build-cards-one-line.md`.
- [x] **Cut text on Staff, Stats, the opener and How to Play (UI rule 13).** Staff is one line per person with a chip; Stats shows numbers first and the last 3 rankings, explainers behind a tap; the opener is four short lines; the Menu guide is headings that open on tap. `staff`, `stats` and `howto` left `DENSITY_ALLOW`. The Neighbours part shipped in #265. Build cards stay open above. #287, `decisions/ui-text-cuts-batch.md`.
- [x] **Events with no primary choice, Combo cards with no clamp, short toasts.** Event choices #252; Combo tiles no longer clamp and the legibility scan has no clamp exception; toasts show the body only when the whole fits in 8 words, and all 49 notice titles are 8 words or fewer. #287.
- [x] **Goal pill: one plain goal, and close the expanded list when a sheet opens.** One plain goal #223; the list now closes when any sheet opens. #287.
- [x] **HIGH PRIORITY: Revamp the Neighbours sheet as a list, then a detail per RT, and remove the ranking star for AI RTs.** AI RTs skip `rankWins` and `winStreak` (`aiGoals`); the sheet is a list with one row per RT, a detail per RT and a "?" help view. DeepSeek executor, #259, #265, `docs/plans/neighbour-sheet.md`.
- [x] **HIGH PRIORITY: Replace the construction crane with a building that rises behind scaffolding.** DeepSeek executor, #256, `decisions/rising-build.md`.
- [x] **Remove the Desa path from the code.** Old Desa saves ask to start anew. DeepSeek executor, #257, `progress/cut-desa-code.md`.
- [x] **Cap Pos Ronda so players use the other Popularitas buildings.** `maxCount: 8`; the Kelurahan bot falls through to the other Popularitas buildings. `decisions/pos-ronda-cap-T1.md`.
- [x] **Smaller map: RW of 2 RTs, Kelurahan of 2 RWs with Kampung Sebelah absorbed.** New ladder, stage goals, camera and balance. #275, #276, #277, #278, `docs/plans/smaller-map.md`, `decisions/smaller-map-balance.md`.
- [x] **Spread the staff stats: each stat works two roles and risks two.** Tukang Tagih works on Gaul, Supir on Jujur; Asisten risks Rajin, Petugas PU and Admin Grup WA risk Lobi; new mishap texts; Om Motivasi and Om Lalu Lintas re-leaned. DeepSeek executor, #260, `docs/plans/staff-stat-spread.md` T1.
- [x] **Stop the "build Warung Sembako" hint after Warung Sembako is built.** `bestDraw` skips buildings already built. #250, `docs/plans/warung-draw-hint.md`.
- [x] **Dense housing pays: Rumah 3/4/5, Kos-kosan 10/14, Kontrakan 24/32.** #251, `docs/plans/executor-sonnet-batch.md` T2.
- [x] **Take level-dependent numbers out of building blurbs.** #238, #239, #248, #249.
- [x] **Ship the UI hierarchy plan: four button looks, Wacana list, setup screen.** T1 to T5 merged: #225, #230, #235, #240, #242.
- [x] **Decide on Kecamatan and above from the playtest.** Act 2 in slices, Kecamatan first (`docs/plans/kecamatan-slice.md`); slice 1 is live, slice 2 waits on a playtest.
- [x] **Dropped 2026-11-01: close the gap between the Kelurahan bot's 19 minutes and the 30-minute target.** Superseded by the smaller map and the Kecamatan pacing bands.
- [x] **Dropped 2026-11-01: give idle warga more jobs at Desa.** Desa is cut (`docs/plans/cut-desa-code.md`).
- [x] **Fix the balance failures on the scorecard (first wave).** RT 3★ is a 9 to 12 min band and builder lands at 10.2 min in 10 of 10 seeds; combo hint at week 12; Kecamatan dominated options (item 18, now Unknown); soft-lock takeovers 15 of 15; wifi pile death spiral fixed by capping combo stacking at 3; cheapskate bar is "never stranded"; nightly now runs in about 45 min and uploads its cache. #203, #210, #211, #212, #219, #224; `decisions/rt-3star-pace.md`, `decisions/combo-stack-cap.md`, `decisions/cheapskate-bar.md`. Proof: Nightly run 41262187917, 3 Pass, 12 Fail, 12 Unknown (was 4 / 13 / 10).
- [x] **Make the four staff stats obvious and decisive.** One meaning and icon per stat; a work and a risk stat per role, with named weekly mishaps; cards and applicants say what each stat buys; "who do you send?" events with odds by stat; Bimtek picks the stat; trait chips. #206, `decisions/staff-stats.md`.
- [x] **90s special hires and a portrait for every special.** Six 90s TV and radio types (types, never real people or others' characters) and a 44x60 portrait for all 13 specials. #207, `decisions/staff-portraits.md`.
- [x] **Build the scorecard harness: timeline log and the 9 bots.** `npm run scorecard` plays 9 bots on 10 seeds and writes the section 8 scorecard and a golden-trend file; `nightly.yml` runs it. Soft-lock takeover check included. First result: 4 Pass, 13 Fail, 10 Unknown. See `progress/scorecard-harness.md` (#201).
- [x] **17an (Agustusan) fanfares, SFX and key art.** Made in the engine: drumband fanfare, koplo sting, angklung call, slide whistles, sack hops, kerupuk crunch and a crowd cheer in `src/audio.ts`; a drawn panjat pinang pole, a confetti banner, and bunting and umbul-umbul in July and August. No recorded audio or AI art. #197, `decisions/17an-in-engine.md`.
- [x] **Redo the building panel.** The description is built from the current level; a pixel roof badge (gold with MAKS at the top) replaces the level strip and the max-level messages; the upgrade button reads "Naikkan ke Lv n" with the gain under it and is hidden at the top; disabled reasons are one grey line; Bongkar names the warga still there; "Warga 4/5"; status only when not working. #194, `decisions/building-panel.md`.
- [x] **Make the sim deterministic and property-tested.** `newGame` needs a seed from the caller; a test fails on clock or `Math.random` use in `src/sim/`; fast-check tests hold five rules at 200 games (`PROP_RUNS=1000` for nightly). Left for other tasks: start-new prompt (calendar), builder-bot soft-lock check (scorecard). #191, `progress/determinism-property-tests.md`.
- [x] **Make the phone's back gesture and map gestures safe.** Back closes the top layer (how-to, panel, card, placing); event cards are never skipped; on the bare map the first back shows a 2s hint and a second leaves. Sheets contain overscroll. #190, `decisions/back-gesture.md`.
- [x] **Slow the Kelurahan down and make its stars read the player's own kampung.** Only the player's own RW sends Stempel letters to the player (the backlog had pinned Popularitas at 0). Each star also needs own residents and Popularitas: 50/50, 120/45, 200/40. Bot 3★ moved from 11-15 to about 19 min at 1x; the rest of the gap is a new task. #188, `decisions/kelurahan-own-kampung.md`.
- [x] **Replace 'Kini: do xx' with the pending goals for the next star.** The strip reads "★ berikutnya, N target lagi: ..."; tapping lists every unmet goal, then one next step when it helps. #178, `decisions/goal-strip-star-goals.md`.
- [x] **Redo the staff page UI so it has far fewer buttons.** One card per person with one main button; stats, refuse, mutasi and let go in a detail view; one lowongan button per role. #179, `decisions/staff-cards.md`.
- [x] **Add more buildings that raise Popularitas, so it is not just Pos Ronda.** Praktik Bidan, Panggung Senam and Kolam Pancing, with new art; a langgar was left out (no religious jokes). #180, `decisions/popularitas-buildings.md`.
- [x] **Later buildings cost more, do more and look bigger.** Full table of every building's tier, cost, effect and size; seven buildings moved up; Kontrakan 2x2 with 12 beds, old saves kept. Built before sign-off, reviewed in the PR. #181, `decisions/building-ladder.md`.
- [x] **Stat icons PR 2** and **Stat icons PR 3.** Plain escapes for Lubang Viral and the Orang Dalam person; English uses Orang Inside and Virality so the words become icons; the explainer keeps its word-plus-icon legend. #177, `decisions/stat-icons-2-3.md`.
- [x] **Playtest the Kelurahan.** Bot playtest on seeds 1 to 4 with seven findings and a Kecamatan proposal. The decision is the open task "Decide on Kecamatan and above from the playtest". #182, `decisions/kelurahan-playtest.md`.
- [x] **English e2e on a schedule.** Weekly workflow `e2e-en.yml` (Sundays 20:00 UTC, or by hand). #187, `decisions/e2e-en-schedule.md`.
- [x] **Make the dev seeds look like a proper city.** Planned streets, a wide mix of kinds, road access for every building, checked by tests. Residents rose (45, 87, 60). #186, `decisions/city-seeds.md`.
- [x] **Sejahtera must not reward an empty kampung.** A population ceiling on Sejahtera: 30 at none, 100 from 25 residents. #184, `decisions/sejahtera-cap.md`.
- [x] **Cap Studi Banding.** `maxCount: 3`. #183, `decisions/studi-banding-cap.md`.
- [x] **Add more buildings bigger than 1x1, starting with Balai RW at 2x2.** Reworked with Julian: 1x2 Kos-kosan, Bengkel, Posyandu, Pasar Kaget; 2x2 Koperasi and Balai RW; Lapangan 2x3 with year-round rent; Terminal the only 3x3. Long buildings turn 90 degrees. Square ones reuse their art at full size; long ones are built from the existing one-tile art, which is untouched. #173, `decisions/building-shapes.md`.
- [x] **Force the update with a full-screen screen.** Option A: full screen on the home screen only, a dot and a Perbarui tile in Menu during play. #172, `decisions/id-text-and-update.md`.
- [x] **Review the Bahasa Indonesia UI text (not event content).** Rows 1 to 15 of the proposals doc; row 16 stays Combo. #172.
- [x] **Fit the tutorial dialogue to the game column on desktop.** Fitted in #151; Skip kept on the first-build guide (UI.md rule 10 stands). `decisions/id-text-and-update.md`.
- [x] **Vary the Kecamatan inspection by merging it into the other events.** Four teams as events (Kampung Bersih, Ketertiban, Kampung Sehat, Kampung Digital), each with its own criteria and shortcuts; never the same twice in a row. #168, `decisions/inspect-variants.md`.
- [x] **Show money with the coin icon everywhere, and audit every screen for stat text.** The stat-icon renderer turns every "Rp" amount into the coin and the amount; icons inside buttons leave the tap to the button; the Neighbours row reads 1★. #170, `decisions/coin-icon.md` (audit table there).
- [x] **HIGH PRIORITY: Let AI RTs build many more kinds of building** and **Explain how another RT wins the yearly competition.** Each trait wants 11 to 13 kinds, partners of half-built combos first; every trait finds 4 or more combos and reaches 3★. The Neighbours row shows each RT's score against this year's target and its parts. #162.
- [x] **Check why the first RT's map looks smaller after expansion** and **Allow RW and higher buildings inside the RT too.** The seams took each RT's edge row and column; they now sit between the RTs, so the RT keeps its 13x17. RW and Kelurahan buildings may stand on the player's RT lots. #165, `decisions/seam-gap.md`.
- [x] **Add a rotate button while placing a building.** Cancel, Rotate, Place under the ghost; the building keeps that facing. #167, `decisions/place-rotate.md`.
- [x] **One big yearly event the player cannot just click away.** Lomba Agustusan: a 3-month prep window (contests, stage, ketua panitia), then the day with a panjat pinang timing climb, a balap karung tap race and rolled contests. Staff stats set the odds, Popularitas the turnout; prize Viral, rupiah and a trophy on the Kantor. #152, `decisions/lomba-agustusan.md`.
- [x] **Don't force-place the building in the centre after choosing it in Build.** Build mode waits for a tap: free spots glow and the first tap places it. #161, `decisions/place-on-tap.md`.
- [x] **HIGH PRIORITY: Fix an RT that never builds again after the player takes it over and hands it back.** It came back unfunded with auto-dana off; hand-back now restores auto-dana, and a toast and the panel say what it needs. #160, `decisions/handback-funding.md`.
- [x] **Make the permit and build phases clear, with cranes while building.** A staked plot under the permit sign, then a tower crane over the scaffold. #164, `decisions/crane-phases.md`.
- [x] **Add a developer test mode that jumps to a seeded higher-level game.** Settings, Developer: RT 3★, RW 3★ and Kelurahan seeds, two taps to confirm. #158, `decisions/dev-seeds.md`.
- [x] **Tie tutorial tips to an action, not to a timer** and **Teach the combo mechanic in the tutorial.** No tip reads the month; the first shop names a combo to build beside it, and the first combo points at Menu, Combo. #156, `decisions/tutorial-tips-actions.md`.
- [x] **Rethink the tukang parkir liar.** Spawn less (first shop always, then 30%, at most 4, never beside a Kantor) and tertibkan with a Hansip or 1 Orang Dalam. #150, `decisions/parkir-rethink.md`.
- [x] **Kelurahan 2★ and 3★ balance.** Bot runs for 2★ and 3★ in `tests/kel-bot.test.ts` pass. #154, `progress/balance-bots-rw3-kel.md`.
- [x] **RW 3★ balance.** Bot run with 2 AI RTs at 3★ passes. #154, `progress/balance-bots-rw3-kel.md`.
- [x] **Range checks from top corners.** Kanibal and decoration boosts use `withinEdges`. #151, `decisions/ui-batch-oct29.md`.
- [x] **Say why the population stalls.** `shortGoal` names the building that draws most per rupiah. #151, `decisions/ui-batch-oct29.md`.
- [x] **Explain big drops in the 2045 meter.** A toast names the meter that fell (and the shut warung). #151, `src/sim/warnings.ts`.
- [x] **Make the pause state obvious, and freeze animation when paused.** PAUSED pill at the bottom, world clock stops. #151, `decisions/ui-batch-oct29.md`.
- [x] **Let the player use Orang Dalam from the building panel while it waits for a permit.** The skip-permit button now leads the panel. #151, `decisions/ui-batch-oct29.md`.
- [x] **Put the combo goal ahead of "build a house" in the goal strip.** `starWaitsOnCombo` puts the combo first. #151, `decisions/ui-batch-oct29.md`.
- [x] **Warn once when monthly Popularitas drops.** One-time warning naming the cause, saved in `warned`. #151, `src/sim/warnings.ts`.
- [x] **Show the combo's buildings on the combo pop-up.** Member sprites joined by "+" under the title. #151, `progress/ui-batch-oct29.md`.
- [x] **Add a small button to minimize the satellite view.** `#cs-sat-toggle`, saved as `satMin`. #151, `decisions/ui-batch-oct29.md`.
- [x] **HIGH PRIORITY: Make AI RTs lay Jalan Setapak and show their residents walking.** AI RTs lay Jalan Setapak to their Kantor and their warga walk it. #149, `progress/ai-jalan-setapak.md`.
- [x] **Lowongan applicants vanish (staffing).** Applicants wait until hired or cancelled, arrive as a card with a Buka Staf button, and the Menu shows how many wait. #144, `progress/staff-applicants-wait.md`.
- [x] **Levers to speed up neighbour RT stars**, **Auto-fund the neighbouring RTs** and **Combos count globally for RT star goals.** Dana banks up to 12 (x1 or x6) with a "+N% boost", auto-dana per RT with a Rp 5jt floor, each RT's next-star checklist, and shared combos for AI RTs (a Rajin RT now reaches 3★). #145, `decisions/neighbour-levers.md`.
- [x] **Let the player run an adjacent RT.** Take over an RT in your RW for 3 Orang Dalam and build on its lots, or hand it back any time. #146, `decisions/neighbour-takeover.md`.
- [x] **Shorter Menu labels.** "Peringkat" and "Combo" (ID), "Ranking" and "Combo" (EN). `progress/short-menu-labels.md`.
- [x] **Reword the goal strip's beds line.** `goal.short.beds` says a Rumah houses more residents, in EN and ID. `progress/house-goal-reword.md`.
- [x] **Play a sound on every menu click.** `progress/menu-click-sound.md`.
- [x] **Rename only buildings, behind a pencil, and skip screenshot baselines outside CI.** #142, `progress/rename-gate-and-pencil.md`.

## Ideas

- [ ] **Tune `GRADE_BONUS`.**
  - Problem: The economy may feel thin after grade bonuses went half-yearly.
  - Why: Less income per year than before.
  - Suggested solution: Playtest, then adjust `GRADE_BONUS` if it feels thin.
  - Source: `decisions/41-half-year-report-night-tint.md`
  - `open · — · — · done when:` the economy is playtested and `GRADE_BONUS` is kept or tuned, with a note in `decisions/`.
