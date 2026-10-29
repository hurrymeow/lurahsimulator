# TODO

Open tasks and ideas that are not done yet. Each item has a Problem, a Why and a Suggested solution, then a claim line: `[ ] status · owner · claimed date · done when`. Write all four when you add an item, so the next agent needs no context. To claim one, set status to `claimed`, add your name as owner and today's date, then open a PR. When it merges, move the item to Done. Add any open work you find or leave behind. Shipped work goes in `progress/`, decisions in `decisions/`.

## Tasks

- [ ] **Later buildings cost more, do more and look bigger.**
  - Problem: Most buildings are 1x1 at any stage, and late unlocks are not clearly pricier, stronger or more distinct than early ones. Related: "Add more buildings bigger than 1x1, starting with Balai RW at 2x2".
  - Why: Each star should feel like a step up you can see on the map, as in Kairosoft's builders.
  - Suggested solution: Set a ladder by unlock tier: start 1x1 and cheap, RT stars 1x1 to 2x2, RW 2x2, Kelurahan 2x2 to 3x3, with cost and effect rising per tier (for example x2 cost, x1.5 effect per tier). Audit every building's cost, effect and footprint against the ladder in one table, and pick changes with Hari before building. New art per ART.md at the real footprint; never overwrite the artist's sprites. Check `tests/footprint.test.ts`, `tests/content-footprint.test.ts` and the balance tests.
  - Source: Julian, 2026-10-29
  - `open · — · — · done when:` a table of every building's tier, cost, effect and size is agreed with Hari, the changes ship with art per ART.md, and the footprint and balance tests pass.
- [ ] **One big yearly event the player cannot just click away.**
  - Problem: Events are single pop-ups with a choice, closed in one tap. There is no big yearly moment to aim for.
  - Why: Kairosoft games give each year a big event as a short-term goal, often with a small mini-game. It should use the staff's stats and the kampung's stats, so building and hiring pay off.
  - Suggested solution: Pick one with Hari, then build it as its own screen. Ideas:
    1. **Lomba Agustusan (August):** a 3-month prep window to pick contests and set up a stage. On the day, short tap mini-games (panjat pinang timing, balap karung). Staff Gaul and Rajin set the odds, Popularitas sets turnout, a Lapangan is needed, and Inem headlines the stage (her gig). Prize: Virality, rupiah, a trophy on the map.
    2. **Penilaian Kampung Bersih (the Kecamatan judges' visit):** a 3-month warning, then a budget to spend on looks (paint, banners, pot plants) or on real fixes. The judges score the Laporan, Sejahtera and what they see on the map. Staff Lobi and Admin Grup WA help. The satire: dressing up for the visit.
    3. **Musim Banjir Besar (January):** prep before (biopori, Kerja Bakti), then a 30-second mini-game where the player taps to send sandbags along the map's low edge. Petugas PU and Hansip stats, Aman and Perut set the damage.
    4. **Festival Kuliner (once a year):** every Rumah Makan and warung competes, with a quick order-rush mini-game. Franchises and brands matter; the winner draws visitors for months.
  - Keep the tone rules: no real politicians or elections, and no religious or ethnic jokes, so holiday events stay about logistics (for example THR and mudik), never the faith. Log the pick in `decisions/`, and fit it to the popup spacing in GAME-DESIGN.md section 3.
  - Julian, 2026-10-29: picked 1, Lomba Agustusan.
  - Source: Julian, 2026-10-29
  - `claimed · voidinside99 (Julian) · 2026-10-29 · done when:` one yearly event with a prep window and a short mini-game ships, uses at least one staff stat and one kampung meter, cannot be closed in one tap, and works in ID at 320px with an e2e test.
- [ ] **Stat icons PR 2.**
  - Problem: After the stat-icon renderer in `progress/stat-icons.md`, buildings, inspector, events, jobs, staff, mangkrak, calo, Wacana and Realisasi still need verification and fixes.
  - Why: The renderer iconifies stat words everywhere, so sentences that read oddly with an icon noun, and slang uses that must stay words, will leak until they are checked.
  - Suggested solution: Verify and fix those screens, reword icon-noun sentences, and check the "Lubang Viral" / "Viral Pothole" title.
  - Source: `decisions/stat-icons.md`
  - `open · — · — · done when:` those screens are verified in ID, with no icon-noun leaks and no slang replaced.
- [ ] **Stat icons PR 3.**
  - Problem: Stage goals, Kelurahan and RW goals, stats explainer, How to play and report card still need the stat-icon check.
  - Why: Those screens carry stat words in goals and explanations, where an icon alone can lose meaning.
  - Suggested solution: Check those screens, keeping one word-plus-icon legend in the stats explainer.
  - Source: `decisions/stat-icons.md`
  - `open · — · — · done when:` those screens are verified in ID, with the explainer legend kept.

- [ ] **Playtest the Kelurahan, then decide on Kecamatan and above.**
  - Problem: Only stages 1 to 3 are specified.
  - Why: Nothing past the Kelurahan is designed, and the Kelurahan has not been played end to end.
  - Suggested solution: Playtest the Kelurahan, then write up what Kecamatan and above should be.
  - Source: GAME-DESIGN.md section 1 and section 7
  - `open · — · — · done when:` the playtest is done and Hari has decided on Kecamatan and above.
- [ ] **Force the update with a full-screen screen.**
  - Problem: The update banner (`src/pwa/update.ts`) stays all session unless clicked.
  - Why: Players stay on old builds. Hari wants a forced update, not a dismissible banner.
  - Suggested solution: Show a full-screen "Update now" screen with one button. Decide when it shows (home only, so play never reloads mid-session).
  - Source: 16-min playtest, 2026-10-28
  - `open · — · — · done when:` a full-screen "Update now" screen replaces the banner, at a point Hari agrees.
- [ ] **Review the Bahasa Indonesia UI text (not event content).**
  - Problem: Untranslated English, stiff or awkward phrasing, inconsistent terms, clipped text and overlong labels in the ID UI.
  - Why: The ID text is the default language and reads rough in places.
  - Suggested solution: Suggest fixes in a table of current text, suggested text and why, and wait for Hari to pick before any code.
    1. Run the app in `id` with Playwright, mobile portrait, at 320 and 412px. Reuse the crawl in `/mnt/project-files/audit/crawl/` (`audit.spec.ts`, `tut.spec.ts`).
    2. Walk every screen: HUD, Menu, the 4 Build tabs, building and tile panels, Settings, Buku Combo, report card, tips and home. Skip event popups.
    3. Dump each visible string with its screen and width. Flag clipped text by `scrollWidth > clientWidth` and by screenshot at 320px.
    4. Cross-check the strings against `src/i18n` for English left in `id`, and against `decisions/resource-names.md`. Keep the deliberate names (for example Orang Dalam).
    5. Skip stat words. The icons-for-stats plan (`/mnt/project-files/plans/icons-for-stats-plan.md`) replaces them with icons.
    6. Return the table to Hari. After Hari picks, edit strings in one PR, run `npm run e2e` (id and en), and log the choices in `decisions/`.
  - Source: playtest
  - `open · — · — · done when:` Hari has picked fixes from the table and one PR with the string edits is merged, with `npm run e2e` (id and en) green.
- [ ] **Fit the tutorial dialogue to the game column on desktop.**
  - Problem: On a desktop browser the tutorial dialogue bar (Inem) spans the whole window instead of the centred game column. The screenshot also shows a Skip button, but tip cards have no Skip, only "Tap to continue".
  - Why: The dialogue sits detached from the game and looks broken on PC. The Skip breaks the tip rule in AGENTS.md and UI.md.
  - Suggested solution: Constrain the dialogue to the game column width and remove the Skip button from tip cards.
  - Source: Hari, 2026-10-28
  - #151 fitted the opener note to the 560px game column (desktop e2e added). Skip was kept, because UI.md rule 10 gives the multi-step first-build tutorial a Skip; Hari to choose: 1) keep Skip, or 2) remove it and update UI.md. See `decisions/ui-batch-oct29.md`.
  - `open · — · — · done when:` the dialogue fits the game column at desktop widths, has no Skip button, and an e2e test at a desktop viewport covers it.
- [ ] **Don't force-place the building in the centre after choosing it in Build.**
  - Problem: After picking a building in build mode it is placed at the screen centre.
  - Why: It blocks the view and invites mistaps.
  - Suggested solution: Place where the player taps, or start the target off the main view.
  - Source: Hari, 2026-10-28
  - `claimed · voidinside99 (Julian) · 2026-10-29 · done when:` choosing a building does not drop it in the centre, the target does not cover the map, and mistaps drop at 320px. e2e covers it.
- [ ] **Tie tutorial tips to an action, not to a timer.**
  - Problem: Hari finds the guide pop-ups random. In `src/ui/howto.ts` some tips fire from actions (first permit queue, first arrival), but house, combo, jobs, wacana and ranking use `s.month >= 3` or `>= 9`.
  - Why: Without a visible trigger the tip has no "so what".
  - Suggested solution: Replace the month tests with the action that makes the tip matter, and say the reason in the tip.
  - Source: Hari, 2026-10-28
  - `claimed · voidinside99 (Julian) · 2026-10-29 · done when:` no tip fires on month alone, each fires from a player action or a state it explains, and says what the player gains. Check against GAME-DESIGN.md section 3.
- [ ] **Teach the combo mechanic in the tutorial.**
  - Problem: There is one combo tip (`how.4`, id `combo` in `src/ui/howto.ts`) and no guided step.
  - Why: Combos earn the 1★ and the player is not shown how to make one.
  - Suggested solution: Add a short step: place two buildings side by side, see the combo trigger, find it in the Combo list. Tie it to an action.
  - Source: Hari, 2026-10-28
  - `claimed · voidinside99 (Julian) · 2026-10-29 · done when:` a new player is shown how to make a combo by doing one, the step fires after an action, has no Skip, and is covered in EN and ID.
- [ ] **Add more buildings bigger than 1x1, starting with Balai RW at 2x2.**
  - Problem: Few buildings are bigger than one tile. Today only Lapangan (3x3) and Sawah, Taman Bermain, Balai Warga, PAUD and Gudang Material (2x2) are (`FOOTPRINT` in `src/data/buildings.ts`). RW buildings such as Balai RW (`src/data/higher/rw.ts`) are still 1x1. Hari, 2026-10-28.
  - Why: A town hall the size of a house does not read as a bigger stage. Larger footprints also make map space and placement matter, which is the Kairosoft feel GAME-DESIGN.md aims at.
  - Suggested solution: Make Balai RW 2x2 first. Then pick a few more from: Posyandu, Pasar Kaget and Portal (RW), Kantor RT, Indomaret and Alfamart, Kos-kosan, Bank Sampah, Parkir. Keep one size per stage tier so the ladder reads clearly. For each: set its footprint, redraw its sprite at the larger size per ART.md (draw at the real size with `new Painter(n)`, stay inside the footprint and the 40-pixel headroom), and re-check combo range, which already counts edge to edge. Never overwrite the artist's assets from #18; add new art or ask the artist. Check `tests/footprint.test.ts` and `content-footprint.test.ts`, and the road-access and crowding rules. Pick the candidates with Hari before building, and log them in `decisions/`.
  - Source: Hari, 2026-10-28
  - `open · — · — · done when:` Balai RW is 2x2 with new art per ART.md, the agreed extra buildings are larger with art, the footprint tests and combo tests pass, nothing clips at 320px, and the artist's sprites are untouched.

## Done

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

- [ ] **English e2e on a schedule.**
  - Problem: CI runs Indonesian only (`decisions/default-lang-id.md`), so English clipping is not caught in PRs.
  - Why: English is the default UI language in-game.
  - Suggested solution: A nightly or weekly workflow runs the `-en` projects without slowing PRs.
  - Source: `decisions/default-lang-id.md`
  - `open · — · — · done when:` a scheduled workflow runs the en projects and reports failures.
- [ ] **Tune `GRADE_BONUS`.**
  - Problem: The economy may feel thin after grade bonuses went half-yearly.
  - Why: Less income per year than before.
  - Suggested solution: Playtest, then adjust `GRADE_BONUS` if it feels thin.
  - Source: `decisions/41-half-year-report-night-tint.md`
  - `open · — · — · done when:` the economy is playtested and `GRADE_BONUS` is kept or tuned, with a note in `decisions/`.
- [x] **Rename only shops and facilities that are buildings.** Shipped in PR #142, see `progress/rename-gate-and-pencil.md`.
- [x] **Make renaming a building hard to trigger by mistake.** Shipped in PR #142: a pencil beside the name opens the rename field. See `progress/rename-gate-and-pencil.md`.
- [x] **Skip screenshot baselines outside CI's image.** Shipped in PR #142: visual baselines run only when `CI` is set. See `progress/rename-gate-and-pencil.md`.
