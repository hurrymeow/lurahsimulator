# TODO

Open tasks and ideas that are not done yet. Each item has a Problem, a Why and a Suggested solution, then a claim line: `[ ] status · owner · claimed date · done when`. Write all four when you add an item, so the next agent needs no context. To claim one, set status to `claimed`, add your name as owner and today's date, then open a PR. When it merges, move the item to Done. Add any open work you find or leave behind. Shipped work goes in `progress/`, decisions in `decisions/`.

## Tasks

- [ ] **CI and test config: flaky reports, English, WebKit, nightly, console-error fixture and canaries.**
  - Problem: a test that passes on retry leaves no record; English is only checked weekly; tests run in Chromium only; there is no nightly workflow.
  - Why: TESTING.md items 2, 9 and 13 fail today, and items 6, 11, 12 and 17 need a nightly run. Items 5 and 15 (merged in from the console-error task): e2e does not fail on `pageerror` or `console.error`, and nothing proves the legibility scan or visual diff can fail.
  - Suggested solution: add a `json` reporter, always upload it, and list flaky tests in the run summary. When `src/i18n/` changes, add an English project at 412px. Add a WebKit project at 412px with 5 smoke specs on PRs and the full suite nightly. Add `nightly.yml`. Add a shared Playwright fixture that fails on `pageerror` and `console.error`, with a reasoned allowlist, and canary tests that inject a clipped label, small text, a small button and a layout shift. Update AGENTS.md's CI lines in the same PR. Land the fixture before the gesture task adds specs, or expect a rebase.
  - Source: TESTING.md items 2, 5, 9, 13, 15; `decisions/testing-checklist.md`
  - `open · — · — · done when:` all of it runs, the fixture covers all specs, every canary fails as expected, and AGENTS.md matches CI.
- [ ] **Build the scorecard harness: timeline log and the 9 bots.**
  - Problem: GAME-DESIGN.md section 8 needs a timeline log and 9 bot strategies; only idle and builder exist.
  - Why: without them most design checklist items stay Unknown, so agents cannot review mechanics.
  - Suggested solution: log every event in the sim to a timeline; add the 7 missing bots; `npm run scorecard` writes the section 8 scorecard and a golden-trend file.
  - Source: TESTING.md item 7; GAME-DESIGN.md section 8
  - `open · — · — · done when:` the scorecard has no blank rows and runs nightly in under 20 minutes.
  - Order: build after the weekly calendar and the determinism task. Bots play 1x and 2x only (no 4x). Minutes follow 8s a week, 4 weeks a month, 48 a year; pass targets include RT 3★ in about 12 min. Needs `nightly.yml` from the CI task: add a stub if that has not landed.
- [ ] **Make the sim deterministic and property-tested.**
  - Problem: `newGame` defaults its seed from `Date.now()` in `src/sim/state.ts`; no property tests check the sim's hard rules.
  - Why: TESTING.md items 1 and 6. Random games find bugs the two bots never try.
  - Suggested solution: move the default seed to the caller; lint `src/sim/` for wall-clock and `Math.random`; add fast-check tests for stars never drop, no negative counts, no soft-lock, save round-trip (200 games in `npm test`, 1,000 nightly). Also check an incompatible save shows the start-new prompt (no save migrations).
  - Source: TESTING.md items 1, 6
  - `open · — · — · done when:` the lint and property tests pass in CI.
- [ ] **Make the phone's back gesture and map gestures safe.**
  - Problem: `src/` has no history handling, so Android back does not close panels. Map gestures may also trigger pull-to-refresh, double-tap zoom or edge-swipe back.
  - Why: back that quits the app loses the session, and a pull-down reload loses the month. UI.md review checklist items 7 and 8 fail or are untested.
  - Suggested solution: push a history entry per open panel and close the top panel on popstate; on the bare map, ask before leaving. Set `overscroll-behavior: contain` and `touch-action` on the map and sheets. Add the T2 checks from items 7 and 8 to `tests/e2e/ui.spec.ts`.
  - Source: UI.md, Review checklist, items 7 and 8
  - `claimed · Claude (project thread) · 2026-10-31 · done when:` back closes the top panel on every sheet, and the item 8 gesture checks pass.
- [ ] **Cap Pos Ronda so players use the other Popularitas buildings.**
  - Problem: Pos Ronda has no `maxCount`. The Kelurahan bot built 20 to 90 of them to hold Popularitas in a big kampung.
  - Why: A wall of Pos Ronda is the cheapest Popularitas, so Praktik Bidan, Panggung Senam and Kolam Pancing (#180) are skipped and the map looks the same.
  - Suggested solution: Give Pos Ronda a `maxCount` per stage (for example 4 at RT, 8 at RW, 12 at Kelurahan), or make each one past the fourth give less. Rerun `tests/kel-bot.test.ts` and the balance tests after the weekly calendar lands, and again after the scorecard exists.
  - Source: `decisions/kelurahan-own-kampung.md`, open question 3
  - `open · — · — · done when:` Pos Ronda cannot be spammed, and the RT, RW and Kelurahan bots still reach their stars.
- [ ] **Close the gap between the Kelurahan bot's 19 minutes and the 30-minute target.**
  - Problem: After #188 the Kelurahan bot reaches 3★ at months 139 to 147 (about 19 min at 1x; month numbers shift when the weekly calendar lands, so re-baseline after it). The target is about 30. The AI side is fast: every RW reaches its stars by month 80 to 110.
  - Why: The bot never hesitates, so a person is slower, but how much slower is unknown, and the stage may still feel short.
  - Suggested solution: Hari decides whether 19 bot-minutes is enough. If not, slow the AI RWs (longer `buildEvery` at the Kelurahan) rather than raising the own-kampung goals, which risks trapping a big kampung under the Popularitas bar (see the decision note).
  - Source: `decisions/kelurahan-own-kampung.md`, open question 2
  - `open · — · — · done when:` Hari has decided, and the Kelurahan bot's 3★ month matches that decision.
- [ ] **Decide on Kecamatan and above from the playtest.**
  - Problem: `decisions/kelurahan-playtest.md` proposes Kecamatan (a ring of districts, Musrenbang, pinjol and judol) and one line for each stage above. Hari has not decided.
  - Why: GAME-DESIGN.md section 2 waits on this before Kecamatan is specified.
  - Suggested solution: Hari answers the four questions at the end of the playtest doc; then section 2 gets a Kecamatan entry.
  - Source: `decisions/kelurahan-playtest.md`
  - `open · — · — · done when:` Hari has decided, and GAME-DESIGN.md section 2 specifies Kecamatan.

- [ ] **Remove the Desa path from the code.**
  - Problem: Hari cut Desa on 2026-10-31, but `src/ui/stage.ts` still offers an "accept Desa" button, and `src/sim/kel.ts` and `src/sim/access.ts` still carry Desa rules (BUMDes, Embung, Pendamping Desa, Panen Raya, Wisata Edukasi).
  - Why: the spec and the game now disagree (`decisions/cut-desa.md`). Players can pick a path the design no longer has.
  - Suggested solution: drop the Desa button, `path: 'desa'` and the Desa-only buildings, jobs and combos. Treat old saves with `path: 'desa'` as incompatible (no save migrations). Update tests and strings in en and id.
  - Source: `decisions/cut-desa.md`
  - `open · — · — · done when:` no Desa string or branch remains in `src/`, and the Kelurahan tests pass.

## Done

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
