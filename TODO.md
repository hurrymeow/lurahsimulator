# TODO

Open tasks and ideas that are not done yet. Each item has a Problem, a Why and a Suggested solution, then a claim line: `[ ] status · owner · claimed date · done when`. Write all four when you add an item, so the next agent needs no context. To claim one, set status to `claimed`, add your name as owner and today's date, then open a PR. When it merges, move the item to Done. Add any open work you find or leave behind. Shipped work goes in `progress/`, decisions in `decisions/`.

## Tasks

**Approval (Hari, 2026-11-02):** TODO items do not wait on Hari. The agent that claims an item judges the work against GAME-DESIGN.md §8, the UI.md review checklist and TESTING.md, and approves it itself. A bot run, a nightly scorecard and CI count as the playtest. Record the verdict in `decisions/`. Ask Hari only for what needs his hands: credentials and secrets, GitHub or repo settings, spending money, and irreversible actions such as deleting data or rewriting main.

Ranked 2026-11-01 with Hari: Now, Next, Later, top first within a tier. Rank by player pain, then unblock value, then cost.

### Now

### Next

- [ ] **Keep every building sprite inside its footprint.**
  - Problem: 31 sprites draw past their footprint's front edges (`SPILL_ALLOW` in `tests/footprint-art.test.ts`). The 2x2 Kelurahan and Kecamatan buildings spill 10px, most likely their shadow. Shop props spill more: the Bengkel car pad 51px, the Pos Satpam barrier 22px, the Warung crate 16px, Baliho 15px, Indomaret and Alfamart 14px, the Bidan sign 11px, Kantor RT and Bank Sampah 8px.
  - Why: UI.md rule 17. A prop over the next tile hides a road or a neighbour's badge.
  - Suggested solution: pull each prop back inside the diamond, or move it behind the building, then lower or delete its `SPILL_ALLOW` entry. Never overwrite the artist's sprites; these are all code-drawn.
  - Source: `decisions/ui-rule-checks.md`
  - `open · — · — · done when:` `SPILL_ALLOW` is empty, or each entry left has a reason in `decisions/`.
- [ ] **Let the player control and build on the 2nd RT after the RT reaches 3★, and add the AI-run RT later, each with a tutorial.**
  - Problem: At 3★ the RT expands and the player has no clear next step in a second town. Hari, 2026-11-02: "after expanding from RT 3 star, let players control and build on the 2nd town, and introduce the RT AI later". The tutorial teaches only the first RT, so a new player gets no guidance when the second RT becomes theirs.
  - Why: Building is the action the player already knows. Handing over the 2nd RT first gives the player a full loop before the AI-run RTs arrive, and it keeps the AI-run RT step small. Each step needs its own tutorial, so the player learns the new controls before they reach a larger map.
  - Suggested solution: plan it after the RT 3★ expansion is settled. Step 1: the 2nd RT is player-controlled from the 3★ expansion, with its own tutorial steps (the lots, the first build, the stars). Step 2, later: the AI runs RTs, with a tutorial for that. Link it to the build-on-AI-RTs item above (the AI-run RT step), and to the smaller map in `decisions/smaller-map-go.md`, which sets the 2-RT RW and the 4-RT Kelurahan. Needs a planning thread first.
  - Source: Hari, 2026-11-02, thread "Log player-built second RT to TODO".
  - `claimed · voidinside99 · 2026-11-04 · done when:` after the 3★ expansion, a new player builds in the 2nd RT with a tutorial for each step, EN and ID at 320 px, and the AI-run RT step follows with its own tutorial.

- [ ] **Playtest the smaller map from RT 3★ to Kelurahan 3★ (T9).**
  - Problem: T1 to T8 are merged and tuned from bot numbers only. No person has played the new ladder.
  - Why: T8 left questions bots cannot answer: stage lengths are short of target (RW about 7 min against 20, Kelurahan about 16 against 30), and preman can sink Aman at the Kecamatan.
  - Suggested solution: play it, then log what changes in a new `decisions/` file. The notes are under "For Hari" in `decisions/smaller-map-balance.md`.
  - Source: `docs/plans/smaller-map.md`, task T9.
  - `open · Hari · — · done when:` a decisions file records the playtest and what it changes.
- [ ] **Show which RW and RT is yours and which the AI runs on the map, and let the player take over an RT in another RW.**
  - The own-RW limit is gone: #297 lets the player build on any AI-run RT, in any RW. The map nameplates are in the next PR.
  - Problem: the map does not say which RW is the player's, which RT is the player's, which are AI-run and which the player controls. Hari, 2026-11-01: "super unclear in map". Hari also sees no reason the player cannot take over an RT under another RW. Ambil alih works in the own RW only.
  - Why: the player cannot read who owns what, so Dana, takeover and the star goals have no visible target. The own-RW limit is a rule with no reason the player can see.
  - Suggested solution: mark owner on the map and in the Neighbours list (own RT, AI RT, RW border, plain and non-colour-only per UI.md). Decide whether takeover or build-on-AI-RTs lifts the own-RW limit. Plan it together with the two HIGH PRIORITY items above ("Revamp the Neighbours sheet" and "Build on AI RTs"), which share files `src/sim/rules.ts`, `src/render/map.ts` and `src/ui/neighbours.ts`. Needs a planning thread first.
  - Source: Hari, 2026-11-01.
  - `open · — · — · done when:` a first-time player can tell at a glance, at 320 px in EN and ID, which RT is theirs, which are AI-run and which RW each belongs to, and the own-RW takeover limit is lifted or explained in the UI.
- [ ] **Make the path to RW 2★ clear, and find why the pacing and UI checklists let it pass.**
  - Problem: Hari, 2026-11-01: the way to bring the RW to 2★ is "absolutely unclear", and asks how it passed the pacing and UI tests. The 2★ goal (GAME-DESIGN.md, RW 1★) is Kampung Sebelah at 1★ or above, 1 win against RW Sebelah and 2 RW combos. Two of the three depend on the AI RT in the Neighbours sheet, which Hari calls unusable, and the ranking win is the goal already marked for removal on AI RTs.
  - Why: the checklists are not blind to this, they were not run on it. GAME-DESIGN.md §8 judges the sim by bots, which reach the stars without reading the screen, and the audit covered screens and word counts, not whether a goal can be acted on. The "Neighbours" screens are in UI.md rule 13 failures only for text volume. No checklist item asks "can a new player name the next action for this star from the screen alone". The bot passes are a lower bound for sim balance, not for clarity.
  - Suggested solution: first play RW 1★ to 2★ by hand with the screen only, and write down each point where the next action is not visible. Then add one item to UI.md's review checklist and one to GAME-DESIGN.md §8: each star goal part names its action and where to do it, tested by an agent that sees only screenshots. Fix the RW goals after the Neighbours revamp lands, since the revamp changes what the goal means. Check "Show which RW and RT is yours" above first.
  - Source: Hari, 2026-11-01.
  - `open · — · — · done when:` a screenshot-only agent run names the next RW 2★ action at every step, the two checklist items exist, and the RW bot still reaches 2★.

- [ ] **Full UI re-audit (T11).**
  - Problem: the 2026-11-01 audit skipped 360px, the dark theme and the Kecamatan. Since then most screens were rewritten.
  - Why: the CI checks for rules 10, 15, 16, 17 and 18 now run (#292, #295), but some rules are still checked by eye (2, 3, 6, 9, 11).
  - Suggested solution: `docs/plans/ui-audit-fixes.md` T11. Rerun the crawl in the project files (`audit/ui-rules-2026-11-01/audit.spec.ts`) at 320, 360, 412 and 430px, in EN and ID, in light and dark, on the RT, Kelurahan and Kecamatan seeds.
  - Source: UI.md "How each rule is checked"
  - `open · — · — · done when:` a new report shows every screen passing, or lists the remaining fails as TODO items.

### Later

- [ ] **Fix the remaining scorecard Fails that have a clear cause.**
  - Problem: after the first balance wave the scorecard reads 3 Pass, 12 Fail, 12 Unknown (Nightly of 2026-11-01). Still failing with a cause: RT 1★ ratio 6.5x among the four main bots (a 18 second gap against 100 seconds, so the 1.3x bar may be too strict at that scale; the claiming agent decides and logs it in `decisions/`), Kel 2★ never reached by shopkeeper and Pencitraan, Hint reader finds only 50% of combos (bar 65 to 85%), Viral pinned near 100 in every band, cash piles up for up to 44 min with no late sink (item 14), goal gaps over the band (7, 10), novelty gaps (11), one reward kind per star (12), Aman pinned at 98% in B4.
  - Why: each Fail is a place the game is too easy, too flat or can strand a player.
  - Suggested solution: one small PR per row, each proved by a Nightly rerun. Cash sink and late Popularitas sources are content, so check them against the Act 2 plan first.
  - Source: `scorecard/scorecard.md`; `decisions/rt-3star-pace.md`; `decisions/combo-stack-cap.md`; `decisions/cheapskate-bar.md`
  - `open · — · — · done when:` each balance row passes or has a stated reason in decisions/.

- [ ] **Finish the scorecard: the 10 Unknown rows and the bot gaps.**
  - Problem: the first scorecard (`scorecard/scorecard.md`) has 10 Unknown rows. Missing: goal ETAs (item 8), the screen checks (3, 27, T2), ablation runs (16), warning lead of fixed beats (22), a worst-event chain (23), Dana, Stempel and Anggaran in the timeline (13), the cause shown on screen (6), plus traits and combos in the data lint (2). The hint bot stalls at 1★ because the combo pointer fires late.
  - Why: section 8 stays partly blind until each row can be judged. The nightly run is also untested on GitHub.
  - Suggested solution: add goal ETAs to the recorder, a forced event chain, per-action ablation runs and the extra resources to the timeline. Add T2 specs for items 3, 6 and 27. Check the first nightly run time (bar 20 min) and trim seeds if needed.
  - Source: `scorecard/scorecard.md`; `decisions/scorecard-harness.md`
  - `open · — · — · done when:` no row reads Unknown for a reason the harness could fix, and a nightly run finishes under 20 minutes.
- [ ] **NEW tags that clear only when the card has really been seen.**
  - The other three parts of the SK 2 playtest note shipped: the Wifi road (#243), Staf in the dock (#291) and the pixel 2 (#296).
  - Problem: NEW tags clear when the Build sheet opens, so a star that unlocks several things shows them only for a moment.
  - Why: unlocks come several at a time and are easy to miss (UI.md checklist item 4).
  - Suggested solution: a card's NEW clears after it has been at least half on screen for 2s, or when it is tapped. Tab and dock badges stay while any card under them is unseen.
  - Source: `decisions/playtest-sk2.md`
  - `open · — · — · done when:` NEW survives opening the sheet without looking, clears on a real view, in ID and EN, and the UI tests cover both.
- [ ] **Low and wide 2x2 art, and native-size cranes on big sites.**
  - Problem: Gudang Material and Koperasi look like a Rumah scaled up, too tall for 2x2. The crane over a 2x2 site is a 1x1 crane scaled 2x, with big pixels out of scale.
  - Why: size should read as width, and every sprite should keep the 1px grid.
  - Suggested solution: redraw the 2x2 buildings (Gudang Material, Koperasi first, then any other 2x2 taller than its tier's 1x1) per ART.md's new geometry rules; draw scaffold and stakes at native pixels for 1x2, 2x2, 2x3 and 3x3 (the crane is being replaced, see the rising-build item). Never overwrite the artist's sprites.
  - Source: `decisions/playtest-sk2.md`
  - `open · — · — · done when:` no 2x2 building stands taller than a 1x1 of its tier, site sprites have no scaled pixels, and `tests/art.test.ts` checks both.

- [ ] **CI and test config: flaky reports, English, WebKit, nightly, console-error fixture and canaries.**
  - Problem: a test that passes on retry leaves no record; English is only checked weekly; tests run in Chromium only; there is no nightly workflow.
  - Why: TESTING.md items 2, 9 and 13 fail today, and items 6, 11, 12 and 17 need a nightly run. Items 5 and 15 (merged in from the console-error task): e2e does not fail on `pageerror` or `console.error`, and nothing proves the legibility scan or visual diff can fail.
  - Suggested solution: add a `json` reporter, always upload it, and list flaky tests in the run summary. When `src/i18n/` changes, add an English project at 412px. Add a WebKit project at 412px with 5 smoke specs on PRs and the full suite nightly. Add `nightly.yml`. Add a shared Playwright fixture that fails on `pageerror` and `console.error`, with a reasoned allowlist, and canary tests that inject a clipped label, small text, a small button and a layout shift. Update AGENTS.md's CI lines in the same PR. Land the fixture before the gesture task adds specs, or expect a rebase.
  - Source: TESTING.md items 2, 5, 9, 13, 15; `decisions/testing-checklist.md`
  - `open · — · — · done when:` all of it runs, the fixture covers all specs, every canary fails as expected, and AGENTS.md matches CI.
- [ ] **Make staffing integral: the permit desk queue (prototype).**
  - Problem: staff are optional bonuses. Inem made permits up to 40% faster, a Hansip adds a little Aman, and nothing breaks or asks for a hire when the player has nobody.
  - Why: in Kairosoft's games staff are the hands that turn money into output, and running short of people is the pressure the player feels. Staffing should tighten the core loop: build, queue, hire or train, build faster.
  - Suggested solution: permits become folders the Kantor clears in order; each Asisten clears some a month; the Asisten role can be posted from RT 1★; the map, panel and goal strip show the queue and say when to hire. Prototype in a PR and judge it against the checklists. Later steps: petugas on big public buildings, output numbers on staff cards, the same queue for Stempel and Serapan.
  - Source: voidinside99, 2026-10-31
  - `claimed · voidinside99 · 2026-10-31 · done when:` the prototype passes the checklists and merges (or is dropped), with the bite tuned in `decisions/desk-queue.md`.

- [ ] **Urusan Pribadi: personal requests and Akrab.**
  - Problem: staff never want anything, so they feel like modifiers, not people.
  - Why: Kairosoft staff feel alive because they ask; a yes or no with a cost makes managing them a choice.
  - Suggested solution: build section 2 of `decisions/staff-requests.md`: requests every 24 weeks from level 2, at most 2 open, deadlines, Akrab hearts, loans rolled on Jujur (repaid, flop, or a small shop), costs scaled to income, and the line bank in ID and EN, each line 20 words or fewer. Never gate stars. Add the card's word count to the rule 13 scan.
  - Source: voidinside99, 2026-11-01
  - `open · — · — · done when:` requests arrive, answer and pay out as written, in ID and EN, within UI.md rule 13, with unit tests for timing, Akrab and loans.
- [ ] **Quest chains for the named specials.**
  - Problem: only Inem has a dream; the 13 specials have a quirk and nothing to chase.
  - Why: a three-step chain gives a special a story, and chains that need another special give the staff an ensemble.
  - Suggested solution: build the table in section 3 of `decisions/staff-requests.md`, on Inem's gig system. Start with the linked pair: Pak Purna's memoir (needs Bu Juru Ketik) and Bu Juru Ketik's typewriter (needs Bang Rental PS).
  - Source: voidinside99, 2026-11-01
  - `open · — · — · done when:` every special has a chain with its payoff, and the linked chains check for the other special.

## Done

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
- [x] **Decide on Kecamatan and above from the playtest.** Act 2 in slices, Kecamatan first (`docs/plans/kecamatan-slice.md`); slice 1 is live, slice 2 waits on Hari's playtest.
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
- [x] **Later buildings cost more, do more and look bigger.** Full table of every building's tier, cost, effect and size; seven buildings moved up; Kontrakan 2x2 with 12 beds, old saves kept. Built before Hari's sign-off, reviewed in the PR. #181, `decisions/building-ladder.md`.
- [x] **Stat icons PR 2** and **Stat icons PR 3.** Plain escapes for Lubang Viral and the Orang Dalam person; English uses Orang Inside and Virality so the words become icons; the explainer keeps its word-plus-icon legend. #177, `decisions/stat-icons-2-3.md`.
- [x] **Playtest the Kelurahan.** Bot playtest on seeds 1 to 4 with seven findings and a Kecamatan proposal. Hari's decision is the open task "Decide on Kecamatan and above from the playtest". #182, `decisions/kelurahan-playtest.md`.
- [x] **English e2e on a schedule.** Weekly workflow `e2e-en.yml` (Sundays 20:00 UTC, or by hand). #187, `decisions/e2e-en-schedule.md`.
- [x] **Make the dev seeds look like a proper city.** Planned streets, a wide mix of kinds, road access for every building, checked by tests. Residents rose (45, 87, 60). #186, `decisions/city-seeds.md`.
- [x] **Sejahtera must not reward an empty kampung.** A population ceiling on Sejahtera: 30 at none, 100 from 25 residents. #184, `decisions/sejahtera-cap.md`.
- [x] **Cap Studi Banding.** `maxCount: 3`. #183, `decisions/studi-banding-cap.md`.
- [x] **Add more buildings bigger than 1x1, starting with Balai RW at 2x2.** Reworked with Julian: 1x2 Kos-kosan, Bengkel, Posyandu, Pasar Kaget; 2x2 Koperasi and Balai RW; Lapangan 2x3 with year-round rent; Terminal the only 3x3. Long buildings turn 90 degrees. Square ones reuse their art at full size; long ones are built from the existing one-tile art, which is untouched. #173, `decisions/building-shapes.md`.
- [x] **Force the update with a full-screen screen.** Option A: full screen on the home screen only, a dot and a Perbarui tile in Menu during play. #172, `decisions/id-text-and-update.md`.
- [x] **Review the Bahasa Indonesia UI text (not event content).** Rows 1 to 15 of the proposals doc; row 16 stays Combo. #172.
- [x] **Fit the tutorial dialogue to the game column on desktop.** Fitted in #151; Hari kept Skip on the first-build guide (UI.md rule 10 stands). `decisions/id-text-and-update.md`.
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

- Menu labels shortened: "Kas & peringkat" to "Peringkat" and "Buku Combo" to "Combo" (ID), with EN "Ranking" and "Combo". See `progress/short-menu-labels.md`.
- **Reword the goal strip's beds line.** Done in the house-goal reword PR: `goal.short.beds` now says a Rumah houses more residents, in EN and ID. See `progress/house-goal-reword.md`.
- [x] **Play a sound on every menu click.** Shipped in `progress/menu-click-sound.md`.

## Ideas

- [ ] **Tune `GRADE_BONUS`.**
  - Problem: The economy may feel thin after grade bonuses went half-yearly.
  - Why: Less income per year than before.
  - Suggested solution: Playtest, then adjust `GRADE_BONUS` if it feels thin.
  - Source: `decisions/41-half-year-report-night-tint.md`
  - `open · — · — · done when:` the economy is playtested and `GRADE_BONUS` is kept or tuned, with a note in `decisions/`.
- [x] **Rename only shops and facilities that are buildings.** Shipped in PR #142, see `progress/rename-gate-and-pencil.md`.
- [x] **Make renaming a building hard to trigger by mistake.** Shipped in PR #142: a pencil beside the name opens the rename field. See `progress/rename-gate-and-pencil.md`.
- [x] **Skip screenshot baselines outside CI's image.** Shipped in PR #142: visual baselines run only when `CI` is set. See `progress/rename-gate-and-pencil.md`.
