# TODO

Open tasks and ideas that are not done yet. Each item has a Problem, a Why and a Suggested solution, then a claim line: `[ ] status · owner · claimed date · done when`. Write all four when you add an item, so the next agent needs no context. To claim one, set status to `claimed`, add your name as owner and today's date, then open a PR. When it merges, move the item to Done. Add any open work you find or leave behind. Shipped work goes in `progress/`, decisions in `decisions/`.

## Tasks

Ranked 2026-11-01 with Hari: Now, Next, Later, top first within a tier. Rank by player pain, then unblock value, then cost.

### Now

- [ ] **HIGH PRIORITY: Revamp the Neighbours sheet as a list, then a detail per RT, and remove the ranking star for AI RTs.**
  - Problem: At Kelurahan (16 RTs) the sheet is one long scroll. Each RT repeats a red ranking line, the score parts, Dana ×1 and ×6, four Dana otomatis toggles and a help line, Ambil alih and a help line, the trait line, the status line and the full star checklist. Five rule paragraphs come before any RT. Hari, 2026-11-01 (screenshot at RT 16): "absolutely not usable, need total revamp". Neighbour RTs also carry the RT star goals "win the ranking once" (2★) and "twice in a row" (3★), which Hari could not act on.
  - Why: The sheet is the only place the player acts on neighbours, and it fails UI.md rule 13 (50 words in view, 20 per block, 300 per sheet) and the #242 CI scan by far. Bot run on main (RW, seed 2, 40 quarters): funded RTs beat the ranking target every quarter by 2x to 5x, and unfunded RTs stall and never win again, so the ranking goal adds no decision beyond Dana. Its target also counts quarters since game start (`rivalTarget` in `src/sim/grow.ts`), so a late RT such as RT 16 faces 341 on day one.
  - Decided (Hari, 2026-11-01, options 1A and 3A in `/mnt/project-files/plans/neighbour-options.md`):
    - Remove `rankWins` and `winStreak` from the AI RT star check (`neighboursSystem` in `src/sim/grow.ts`). The player's own RT keeps them. AI RTs still count in the player's area ranking (`areaScore`).
    - Drop the per-RT ranking line and score parts (`grow.rank`, `grow.rankParts`) from the sheet.
    - The sheet opens on a list: one row per RT with name, stars, the one blocking need (for example "needs 8 warga") and one status chip (Stalled, Building, Max). Stalled RTs sort first. One "Auto-fund all" control sits at the top.
    - Tap a row for that RT's detail: unmet goals only, Dana ×6 as the filled button, Dana ×1, one Auto chip that cycles Off, 3, 6 and 12, then the actions from the next item. The rule paragraphs move to a "?" help sheet.
    - Folds in the Neighbours part of "Cut text on the 6 screens that fail UI rule 13".
  - Suggested solution: `docs/plans/neighbour-sheet.md` T1 (sim) then T2 (sheet). Was: one PR (Sonnet). Files: `src/ui/neighbours.ts`, `src/sim/grow.ts`, `src/i18n/en.ts`, `src/i18n/id.ts`, the Neighbours e2e specs. Log the choice in `decisions/neighbour-sheet.md`.
  - Source: Hari, 2026-11-01, planning thread "Plan neighbour RT boosts and sheet".
  - `claimed · DeepSeek executor · 2026-11-01 · done when:` the sheet passes the rule 13 scan at 320 px in EN and ID with 16 RTs, every per-RT action is one tap from its row, AI RTs have no ranking goal, and the RW and Kelurahan bots still reach their stars.
- [ ] **HIGH PRIORITY: Replace the construction crane with a building that rises behind scaffolding.**
  - Problem: The crane (`crane` in `src/render/iso.ts`, drawn by `site('crane', false)` in `src/render/map.ts`) is 44 px tall on a 1x1 tile. It overflows the footprint, floats over neighbouring trees, covers the "1" badges, and gives no sense of how far along the build is. Hari, 2026-11-01: it "looks bad and doesn't work".
  - Why: UI.md rule 17 says map art stays in its footprint. A build site should show progress.
  - Decided (Hari, 2026-11-01, option 4B in `/mnt/project-files/plans/neighbour-options.md`): drop the crane. While building, draw the full building art clipped from the ground up to its build progress, with the scaffold on top and the existing dust fx. Permit keeps the staked plot. Mangkrak keeps grey plus scaffold and does not rise, so a stalled site still looks different. Badges sit on the top of what is drawn.
  - Suggested solution: `docs/plans/rising-build.md` T1. Was: one PR (Sonnet), independent of the neighbour items. Files: `src/render/map.ts`, `src/render/iso.ts`, `tests/e2e` build-phase specs. Update `decisions/crane-phases.md` via a new `decisions/rising-build.md`. If it reads too quiet, add a small hook and cable inside the footprint. This also removes the "native-size cranes" half of "Low and wide 2x2 art".
  - Source: Hari, 2026-11-01, screenshot and planning thread "Plan neighbour RT boosts and sheet".
  - `claimed · DeepSeek executor · 2026-11-01 · done when:` nothing on a build site draws outside its footprint, the site shows its progress, badges read clearly, and build-phase screenshots at 320 and 412 px pass in both languages.
- [ ] **Remove the Desa path from the code.**
  - Problem: Hari cut Desa on 2026-10-31, but `src/ui/stage.ts` still offers an "accept Desa" button, and `src/sim/kel.ts` and `src/sim/access.ts` still carry Desa rules (BUMDes, Embung, Pendamping Desa, Panen Raya, Wisata Edukasi).
  - Why: the spec and the game now disagree (`decisions/cut-desa.md`). Players can pick a path the design no longer has.
  - Suggested solution: `docs/plans/cut-desa-code.md` T1. Drop the Desa button, `path: 'desa'` and the Desa-only buildings, jobs and combos. Treat old saves with `path: 'desa'` as incompatible (no save migrations). Update tests and strings in en and id.
  - Source: `decisions/cut-desa.md`
  - `claimed · DeepSeek executor · 2026-11-01 · done when:` no Desa string or branch remains in `src/`, and the Kelurahan tests pass.

- [ ] **Cap Pos Ronda so players use the other Popularitas buildings.**
  - Problem: Pos Ronda has no `maxCount`. The Kelurahan bot built 20 to 90 of them to hold Popularitas in a big kampung.
  - Why: A wall of Pos Ronda is the cheapest Popularitas, so Praktik Bidan, Panggung Senam and Kolam Pancing (#180) are skipped and the map looks the same.
  - Suggested solution: `docs/plans/pos-ronda-cap.md` T1. Was: give Pos Ronda a `maxCount` per stage (for example 4 at RT, 8 at RW, 12 at Kelurahan), or make each one past the fourth give less. Rerun `tests/kel-bot.test.ts` and the balance tests after the weekly calendar lands, and again after the scorecard exists.
  - Source: `decisions/kelurahan-own-kampung.md`, open question 3
  - `claimed · DeepSeek executor · 2026-11-01 · done when:` Pos Ronda cannot be spammed, and the RT, RW and Kelurahan bots still reach their stars.
- [ ] **Cut text on the 6 screens that fail UI rule 13: Build cards, Staff, Neighbours, Stats, the opener and How to Play.**
  - Problem: audit 2026-11-01, words in view at 320 ID → 412 EN: Build tabs 38–51 → 80–101 (block 24, 573 per tab), Neighbours 97 → 146 (block 32, 1,202 per sheet), Stats 54 → 83, Staff 43 → 71, opener 95 → 113 (block 28), How-to 94. Rule 13 allows 50 in view, 20 per block, 300 per sheet; rule 7 allows 20 per tip.
  - Why: players skim about 20% of the words; a wall of text hides the one line that matters.
  - In flight: the executor runs `docs/plans/ui-audit-fixes.md` T6 to T14. The Neighbours part moved to `docs/plans/neighbour-sheet.md`.
  - Neighbours (Tetangga), Hari 2026-11-01 (screenshot): the sheet opens with five rule paragraphs before any RT data, so it is too texty and too long, with no hierarchy. Each RT row is plain text, so the scores do not stand out.
  - Neighbours fix: show the RT rows first, with the score and star as the one emphasised number per row. Move the rules out of the sheet or cut them to one short line. Turn each row into a tappable list item with a clear secondary action, following the Wacana list (#230) and UI.md rule 14 button roles. Keep it within the rule 13 caps.
  - Suggested solution: `docs/plans/ui-audit-fixes.md` T6 (Build cards), T7 (Neighbours, Stats, Staff) and T8 (opener, How-to, toasts). Wacana is in the hierarchy plan.
  - Source: UI.md rules 7 and 13; audit `audit/ui-rules-2026-11-01/report.md`
  - `open · — · — · done when:` all six pass rules 7 and 13 at 320 to 430px in EN and ID.

### Next

- [ ] **Smaller map: RW of 2 RTs, Kelurahan of 2 RWs with Kampung Sebelah absorbed.**
  - Problem: the RW has 4 RTs and the Kelurahan 16. In the playtest of 2026-11-01 the Kelurahan was overwhelming, and its 1★ waited on "4 RW at 1★" across mostly empty lots.
  - Why: one AI RT to tend at the RW and one AI RW at the Kelurahan keep the management load small, and absorbing Kampung Sebelah guarantees new land when the own-kampung goals need it.
  - Suggested solution: build GAME-DESIGN.md section 2 as now written. The RW map is 2 RTs side by side and the Kelurahan 2x2 RTs at full-size tiles. At promotion Kampung Sebelah becomes player-run (like a takeover), and RW 2 is two new AI RTs. RW goals read Kampung Sebelah; Kelurahan goals read RW 2. Stempel stops at the Kelurahan. Grup Chat Warga moves to RW 2's pair. Re-run the RW, Kelurahan and balance bots, and the frame-rate test. Old saves: decide in the PR (keep their old neighbours, or treat them as incompatible as with the Desa cut).
  - Decided: Hari said yes on 2026-11-01 (`decisions/smaller-map-go.md`). Needs a plan before any code, including how Kecamatan slice 1 changes.
  - Source: `decisions/playtest-sk2.md`
  - `open · — · — · done when:` new games follow the new ladder, the stage goals read as in section 2, and the bot tests reach each stage's stars.
- [ ] **HIGH PRIORITY: Let the player build on AI-run RTs, and add Kunjungan (visit) as a one-tap boost.**
  - Problem: Neighbour RTs feel passive. Dana is pay-and-wait, and the score parts are only a readout. Hari: "felt very passive now, don't know what to do". To build in a neighbour RT you must take it over (Ambil alih, 3 Orang Dalam, own RW only), and then the AI stops building there.
  - Why: Building is the action the player already knows, and it lets the player choose exactly what clears the blocker (houses for warga, the missing combo partner). Orang Dalam piles up unused late on (114 in Hari's screenshot), so it needs a sink.
  - Decided (Hari, 2026-11-01, options 2E and 2B in `/mnt/project-files/plans/neighbour-options.md`):
    - Build on AI RTs (Hari's idea): place buildings on free lots in any AI-run RT cell at normal price. They count for that RT's score, combos and stars, and the AI keeps building on the lots left. Today `checkPlace` blocks AI cells via `neighbourAt` (`src/sim/rules.ts`), and `viewOf` (`src/sim/neighbourView.ts`) reads only the AI's own buildings. Both change, and the AI lot planner must skip the player's lots. The player's buildings there earn and cost upkeep in the player's kas, as takeover does today.
    - Retire Ambil alih and Serahkan (takeover and hand-back). Decide in the PR what happens to saves with a player-run RT (no save migrations, so an incompatible save shows the start-new prompt).
    - Kunjungan: 1 Orang Dalam, the RT builds its next build now and gains a few warga at once. One use per RT per quarter, so keys cannot buy stars too fast.
    - Each row's detail gets "Go to RT", which closes the sheet and pans the map to that cell.
  - Suggested solution: one PR (Sonnet), after the sheet revamp above. Files: `src/sim/rules.ts`, `src/sim/neighbourView.ts`, `src/sim/grow.ts`, `src/sim/balance.ts` (Kunjungan numbers), `src/ui/neighbours.ts`, i18n, `tests/grow.test.ts`. Log in `decisions/build-on-ai-rts.md`.
  - Plan it against the smaller map (`decisions/smaller-map-go.md`): 1 AI RT at the RW, 2 at the Kelurahan. Needs a plan file first.
  - Fallback if Hari's playtest finds panning across 16 RTs a chore: a per-RT build focus (Rumah or the missing combo) instead, and building only in the player's own RW.
  - Source: Hari, 2026-11-01 ("shall we just allow user to build on rt that is controlled by ai as a way to speed up"), planning thread "Plan neighbour RT boosts and sheet".
  - `open · — · — · done when:` a building the player places in an AI RT cell counts for that RT's stars and the AI never builds over it, Kunjungan shows its cost and effect in EN and ID, takeover is gone, and the RW and Kelurahan bots still reach their stars.
- [ ] **Show which RW and RT is yours and which the AI runs on the map, and let the player take over an RT in another RW.**
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
- [ ] **Show a how-to hint for every goal when it is tapped open.**
  - Problem: The tapped goal line says what to reach, but not how to reach it. Hari could not tell how to win "menang peringkat tahunan wilayah 1 kali" (win a yearly wilayah ranking once). The "Langkah berikut" hint under it talked about Warung Sembako and residents, which is unrelated.
  - Why: A player who cannot see the next action stops playing or quits the goal. Hari asked for the hint in the tapped state, so it does not add clutter to the strip.
  - Suggested solution: In the expanded goal state, add one plain line per goal type that names the action (what to build, what to keep, which ranking to win). The hint must match the goal's own condition, not the next stage's. Generalise the Stempel work in `docs/plans/stempel-goal-actionable.md` (T2 matching hint, T4 tap explainer) from that one goal to every goal type. Write the line in EN and ID, and keep it within UI.md rule 13 word limits.
  - Source: Hari's playtest screenshot, 2026-11-01 (project thread "Add goal how-to hints to TODO")
  - `open · — · — · done when:` every goal type shows a matching how-to line in the tapped state, in EN and ID, with no clipping at 320px, and the goal tests cover each type.
- [ ] **Stop a big kampung getting stuck under the Kelurahan 3★ Popularitas bar.**
  - Problem: residents never leave while Popularitas is above 15, and each resident lowers it. A kampung that grows well past 200 settles in the low 30s and cannot get back over the 3★ bar (35). One Kelurahan bot seed of three stays at 2★ for good (#204).
  - Why: a player who grew too fast is soft-locked out of 3★, with no way to see why or fix it.
  - Suggested solution: let the bar scale down with residents over 200, or give the player a way out (a Popularitas building that ignores the roadside limit, or warga who move to the neighbours when the kampung is crowded). Check with `tests/kel-bot.test.ts` that all three seeds reach 3★.
  - Source: `decisions/kelurahan-own-kampung.md`, `decisions/desk-queue-weeks.md`
  - `open · — · — · done when:` a kampung of any size can reach Kelurahan 3★, and the bot test asks for all three seeds.

- [ ] **CI checks for UI rules 10, 15, 16 and 17, then a full re-audit.**
  - Problem: rules 10 (tutorial tap lock) and 17 (map art footprint) have no test; 15 and 16 are checked by eye; the audit skipped 360px, the dark theme and Kecamatan.
  - Why: a rule nothing enforces drifts, as rule 13 did with Wacana.
  - Suggested solution: `docs/plans/ui-audit-fixes.md` T10 (checks, remove the `data-clamp` skip) and T11 (re-audit at 4 widths, both themes, RT, Kelurahan and Kecamatan seeds).
  - Source: UI.md "How each rule is checked"
  - `open · — · — · done when:` the checks run in CI, and the re-audit report shows every screen passing or lists the rest as TODO items.
- [ ] **Events with no primary choice, Combo cards with no clamp, short toasts.**
  - Event choices done in #252; Combo clamp and toasts remain.
  - Problem: 2 of 3 event choices use the primary fill; Combo card effects cut with "…"; toasts run past 12 words.
  - Why: UI.md rules 5, 14 and 16 (2026-11-01).
  - Suggested solution: `docs/plans/ui-audit-fixes.md` T9 (events, Combo) and the toast part of T8.
  - Source: audit `audit/ui-rules-2026-11-01/report.md`
  - `open · — · — · done when:` 0 primaries on event choices, no Combo clamp at 320px ID, toasts 8 words or fewer.
- [ ] **Goal pill: one plain goal, and close the expanded list when a sheet opens.**
  - One plain goal shipped in #223; only the "close the list when a sheet opens" bug remains.
  - Problem: the pill reads "★ berikutnya, 3 target lagi: …" and clamps. In the audit, the expanded goal list stayed open over every sheet after one tap.
  - Why: UI.md rules 5 and 16.
  - Suggested solution: `docs/plans/goal-line-one-goal.md`, plus collapse the list on sheet open (verify the bug first).
  - Source: audit `audit/ui-rules-2026-11-01/report.md`
  - `open · — · — · done when:` the pill shows "Goal: …" with no "…" at 320px ID, and opening any sheet closes the list.

### Later

- [ ] **Fix the remaining scorecard Fails that have a clear cause.**
  - Problem: after the first balance wave the scorecard reads 3 Pass, 12 Fail, 12 Unknown (Nightly of 2026-11-01). Still failing with a cause: RT 1★ ratio 6.5x among the four main bots (a 18 second gap against 100 seconds, so the 1.3x bar may be too strict at that scale; Hari's call), Kel 2★ never reached by shopkeeper and Pencitraan, Hint reader finds only 50% of combos (bar 65 to 85%), Viral pinned near 100 in every band, cash piles up for up to 44 min with no late sink (item 14), goal gaps over the band (7, 10), novelty gaps (11), one reward kind per star (12), Aman pinned at 98% in B4.
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
- [ ] **UI from the SK 2 playtest: NEW tags, the dock, the Wifi road, the pixel "2".**
  - The Wifi road part shipped in #243.
  - Problem: NEW tags clear when the Build sheet opens; Staf hides in the Menu; the Menara Wifi asks for a road; the pixel font's "2" reads like a Z.
  - Why: unlocks come several at a time and are easy to miss; staff now matter every minute.
  - Suggested solution: a card's NEW clears after it has been at least half on screen for 2s or been tapped, and tab and dock badges stay while any card under them is unseen (UI.md audit 4). The dock is Build at its own width, then Warga, Staf and Menu. Add Menara Wifi to the road-exempt list (`FLAT` in `src/sim/access.ts`). Redraw the "2" with `scripts/patch-pixel-font.py`. The visual baselines will change.
  - Source: `decisions/playtest-sk2.md`
  - `open · — · — · done when:` all four ship in ID and EN, nothing clips at 320px, and the UI and visual tests pass.
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
  - Suggested solution: permits become folders the Kantor clears in order; each Asisten clears some a month; the Asisten role can be posted from RT 1★; the map, panel and goal strip show the queue and say when to hire. Prototype in a draft PR for Hari to play. Later steps: petugas on big public buildings, output numbers on staff cards, the same queue for Stempel and Serapan.
  - Source: voidinside99, 2026-10-31
  - `claimed · voidinside99 · 2026-10-31 · done when:` Hari has played the prototype and it merges (or is dropped), with the bite tuned in `decisions/desk-queue.md`.

- [ ] **A portrait for every staff member.**
  - Problem: only Inem and the specials have faces; every other hire is a star badge.
  - Why: a face makes a hire feel like a person, which the personal requests rely on.
  - Suggested solution: paint generic hires with `src/render/portraits.ts`, seeded by their staff id, with the outfit of their job (`decisions/staff-requests.md`, section 1). Show it on the card, the detail view, the applicant card and the request card.
  - Source: voidinside99, 2026-11-01
  - `open · — · — · done when:` every staff member and applicant has a lasting portrait whose outfit reads as their job.
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
- [ ] **The yearly price banner.**
  - Problem: the year's price rise is one quiet notice line.
  - Why: inflation is a real cost the player should feel, and a reason a year is a running joke.
  - Suggested solution: from year 2 the year-end notice is a banner card, "PERHATIAN: Biaya hidup naik {x}% tahun ini", with one reason a year from the bank in section 4 of `decisions/staff-requests.md`, never the same twice in a row, in ID and EN.
  - Source: voidinside99, 2026-11-01
  - `open · — · — · done when:` the banner shows every year from year 2 with a fresh reason, within UI.md rule 13.

## Done

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
