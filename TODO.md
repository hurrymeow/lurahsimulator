# TODO

Open tasks and ideas that are not done yet. Each item has a Problem, a Why and a Suggested solution, then a claim line: `[ ] status · owner · claimed date · done when`. Write all four when you add an item, so the next agent needs no context. To claim one, set status to `claimed`, add your name as owner and today's date, then open a PR. When it merges, move the item to Done. Add any open work you find or leave behind. Shipped work goes in `progress/`, decisions in `decisions/`.

## Tasks

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

- [ ] **Kelurahan 2★ and 3★ balance.**
  - Problem: `tests/kel-bot.test.ts` only checks 1★.
  - Why: Without bot runs, 2★ and 3★ may be unreachable or trivial and nobody would know.
  - Suggested solution: Add bot runs for 2★ and 3★ and tune until they pass.
  - Source: `progress/kelurahan-playable.md`
  - `open · — · — · done when:` `tests/kel-bot.test.ts` has bot runs for 2★ and 3★ and they pass.
- [ ] **RW 3★ balance.**
  - Problem: RW 3★ is unchecked, because it needs 2 AI RTs at 3★.
  - Why: An unmeasured star may be unreachable or too easy.
  - Suggested solution: Run a bot with 2 AI RTs at 3★ and tune until it passes.
  - Source: `progress/rw-playable.md`
  - `open · — · — · done when:` RW 3★ is checked with 2 AI RTs at 3★ and tuned to pass.
- [ ] **Playtest the Kelurahan, then decide on Kecamatan and above.**
  - Problem: Only stages 1 to 3 are specified.
  - Why: Nothing past the Kelurahan is designed, and the Kelurahan has not been played end to end.
  - Suggested solution: Playtest the Kelurahan, then write up what Kecamatan and above should be.
  - Source: GAME-DESIGN.md section 1 and section 7
  - `open · — · — · done when:` the playtest is done and Hari has decided on Kecamatan and above.
- [ ] **Range checks from top corners.**
  - Problem: Combos measure range edge to edge (`decisions/combo-range-and-move-look.md`), but the minimarket Kanibal penalty (`src/sim/brands.ts`) and decoration boosts (`src/sim/state.ts`) still measure from each lot's top corner.
  - Why: A 2x2 or 3x3 neighbour counts as farther than it looks, so the rules feel inconsistent.
  - Suggested solution: Switch both to the same edge-to-edge rule.
  - Source: `decisions/combo-range-and-move-look.md`
  - `open · — · — · done when:` the Kanibal penalty and decoration boosts use the edge-to-edge rule.
- [ ] **Say why the population stalls.**
  - Problem: Arrivals need population below attraction (`attractTarget` in `src/sim/state.ts`). The HUD chip shows beds (`13/15`), so a stall at attraction 12 looks like a bug.
  - Why: The player cannot tell why no one arrives.
  - Suggested solution: When population is at or above attraction, `shortGoal` (`src/sim/nextstep.ts`) should say what to add, for example a Warung. Keep it out of the 320px chip.
  - Source: 16-min playtest, 2026-10-28
  - `open · — · — · done when:` `shortGoal` says what to add when population is at or above attraction, and the 320px chip is unchanged.
- [ ] **Explain big drops in the 2045 meter.**
  - Problem: The meter is the average of Perut, Kerja and Aman (`src/sim/needs.ts`). A Warung that loses its road or gets damaged leaves `isWorking`, so Perut falls and the meter jumps (58 to 22 in the playtest). Not verified against a replay.
  - Why: A big silent drop feels like a bug and the player cannot act on it.
  - Suggested solution: Show a toast naming the cause when the meter drops 10 points or more.
  - Source: 16-min playtest, 2026-10-28
  - `open · — · — · done when:` a toast names the cause when the meter drops 10 points or more.
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
  - `open · — · — · done when:` the dialogue fits the game column at desktop widths, has no Skip button, and an e2e test at a desktop viewport covers it.
- [ ] **Make the pause state obvious, and freeze animation when paused.**
  - Problem: In build mode especially, pause is easy to miss. Trees still move while paused.
  - Why: The player can think the game is running, or think it is broken.
  - Suggested solution: Show the word PAUSED near the bottom of the screen, and stop all sprite and scenery animation while paused. Check against the existing Paused pill (build mode only).
  - Source: Hari, 2026-10-28
  - `open · — · — · done when:` PAUSED shows near the bottom in play and build mode in EN and ID, no animation runs while paused, and an e2e test covers it.
- [ ] **Don't force-place the building in the centre after choosing it in Build.**
  - Problem: After picking a building in build mode it is placed at the screen centre.
  - Why: It blocks the view and invites mistaps.
  - Suggested solution: Place where the player taps, or start the target off the main view.
  - Source: Hari, 2026-10-28
  - `open · — · — · done when:` choosing a building does not drop it in the centre, the target does not cover the map, and mistaps drop at 320px. e2e covers it.
- [ ] **Let the player use Orang Dalam from the building panel while it waits for a permit.**
  - Problem: Hari could not find a way to tap a building waiting for a permit and use Orang Dalam. `src/ui/inspect.ts` already has a skip-permit button (line ~90), so the cause is unknown. Not verified.
  - Why: Orang Dalam is a core mechanic and the player cannot find it.
  - Suggested solution: Find why it was missed (tap target, panel not opening for permit buildings, or the button hidden) and fix that first.
  - Source: Hari, 2026-10-28
  - `open · — · — · done when:` tapping a permit building opens a panel with a clear Orang Dalam button that skips the permit, in EN and ID.
- [ ] **Make renaming a building hard to trigger by mistake.**
  - Problem: Renaming (ganti nama) is easy to hit by accident (`nameInput`, `rename` in `src/ui/inspect.ts`).
  - Why: Misclicks open the keyboard and break the flow.
  - Suggested solution: Show a pencil icon next to the building name. Only tapping it opens the rename field and keyboard. Follow ART.md for the icon.
  - Source: Hari, 2026-10-28
  - `open · — · — · done when:` the name is plain text with a pencil icon beside it, only the icon opens the rename field and keyboard.
- [ ] **Tie tutorial tips to an action, not to a timer.**
  - Problem: Hari finds the guide pop-ups random. In `src/ui/howto.ts` some tips fire from actions (first permit queue, first arrival), but house, combo, jobs, wacana and ranking use `s.month >= 3` or `>= 9`.
  - Why: Without a visible trigger the tip has no "so what".
  - Suggested solution: Replace the month tests with the action that makes the tip matter, and say the reason in the tip.
  - Source: Hari, 2026-10-28
  - `open · — · — · done when:` no tip fires on month alone, each fires from a player action or a state it explains, and says what the player gains. Check against GAME-DESIGN.md section 3.
- [ ] **Put the combo goal ahead of "build a house" in the goal strip.**
  - Problem: `shortGoal` (`src/sim/nextstep.ts`) shows the combo goal only while `discovered.length === 0` after `COMBO_HINT_MONTH`, and the beds goal can win before that.
  - Why: Hari asks why "Kini: bangun Rumah untuk tambah kamar" outranks finding a combo, when the 1★ needs a combo.
  - Suggested solution: Decide what leads when both apply, likely the combo, and log it in `decisions/`. Check against the Now and Next ★ strip and GAME-DESIGN.md section 3.
  - Source: Hari, 2026-10-28
  - `open · — · — · done when:` when both apply the strip leads with the combo that earns the 1★, the order is logged in `decisions/`, and the pacing e2e passes. Both languages checked.
- [ ] **Teach the combo mechanic in the tutorial.**
  - Problem: There is one combo tip (`how.4`, id `combo` in `src/ui/howto.ts`) and no guided step.
  - Why: Combos earn the 1★ and the player is not shown how to make one.
  - Suggested solution: Add a short step: place two buildings side by side, see the combo trigger, find it in the Combo list. Tie it to an action.
  - Source: Hari, 2026-10-28
  - `open · — · — · done when:` a new player is shown how to make a combo by doing one, the step fires after an action, has no Skip, and is covered in EN and ID.
- [ ] **Auto-fund the neighbouring RTs.**
  - Problem: AI-run RTs (Kampung Sebelah) build only while the player funds them. Each Dana pays for one build, max banked is `NEIGHBOUR.fundMax` (`fundNeighbour` in `src/sim/grow.ts`, button in `src/ui/neighbours.ts`). The player must open the screen and tap Fund again and again.
  - Why: Repeated manual funding is chores. RW needs 2 AI RTs, so it multiplies. A neighbour that stalls ("Stalled. Needs funding.") also drags the stage stars.
  - Suggested solution: Add an Auto-fund toggle per RT (or one for all). Each month, if on and `checkFund` passes, call `fundNeighbour` while keeping a cash floor the player sets or a fixed reserve, so it never drains the kas to zero. Show the monthly spend in the Neighbours screen, and keep manual funding as is. Check the economy: auto-funding must not make the bailout or the Rupiah squeeze trivial (`src/sim/balance.ts`). Log the floor rule in `decisions/`.
  - Source: Hari, 2026-10-28
  - `open · — · — · done when:` each RT has an Auto-fund toggle that keeps funding it while the kas stays above the floor, the monthly spend is visible, the setting is saved, and it works in EN and ID at 320px.
- [ ] **Warn once when monthly Popularitas drops.**
  - Problem: Popularitas (`sabar`) can fall every month from queue wear, resident expectations or being broke (`src/sim/tick.ts`), and nothing tells the player. Residents leave below 15.
  - Why: The player sees the loss only when residents leave, which is too late to react.
  - Suggested solution: At month end, if Popularitas fell versus last month, show one warning toast naming the biggest cause (queue, expectations, or broke). Show it once per game so it teaches without nagging; after that only the HUD number changes. Reuse the toast path in `src/app.ts` and the cause tracking from the 2045-meter toast item. Add EN and ID text and keep it short at 320px.
  - Source: Hari, 2026-10-28
  - `open · — · — · done when:` the first monthly Popularitas drop shows a one-time warning with the cause, it never repeats in that save, the flag is saved, and EN and ID are checked at 320px.
- [ ] **Give the player levers to speed up neighbour RT stars.**
  - Problem: Neighbour RTs earn stars by the same checklist as the player (`src/sim/grow.ts`, `stageDef('rt').stars`), but the player only controls Dana. An RT builds at most once per `NEIGHBOUR.buildEvery` months (3, or 2 for Rajin) however much is funded, and holds at most `fundMax` (3) banked builds. Funding more does not make stars come sooner, so waiting feels helpless. Hari, 2026-10-28.
  - Why: RW needs 2 AI RTs at their stars (RW 2★ and 3★), so the player's own progress stalls on RTs they cannot influence. It is also unclear which star each RT is missing.
  - Suggested solution: Pick one or two, then playtest. (a) Show each RT's missing star goal on the Neighbours screen, so the player knows what to fix. (b) Let a bigger or repeat Dana shorten the gap to the next build, with diminishing returns. (c) Let the player send a building or a Posyandu to an RT (`NEIGHBOUR.sabarPerPosyandu` already feeds their Sabar). (d) Add a monthly "Bantu" action with a cooldown that gives the nearest-to-star RT one free build. Tie in the auto-fund item: auto-funding only keeps Dana banked, so it does not solve speed alone. Check balance against `tests/rw-bot.test.ts` and the RW 3★ pacing, and log the pick in `decisions/`.
  - Source: Hari, 2026-10-28. Related: "Auto-fund the neighbouring RTs".
  - `open · — · — · done when:` the player has at least one lever that visibly speeds an RT toward its next star, the Neighbours screen shows what each RT lacks, the bot tests still pass, and EN and ID are checked at 320px.
- [ ] **Add more buildings bigger than 1x1, starting with Balai RW at 2x2.**
  - Problem: Few buildings are bigger than one tile. Today only Lapangan (3x3) and Sawah, Taman Bermain, Balai Warga, PAUD and Gudang Material (2x2) are (`FOOTPRINT` in `src/data/buildings.ts`). RW buildings such as Balai RW (`src/data/higher/rw.ts`) are still 1x1. Hari, 2026-10-28.
  - Why: A town hall the size of a house does not read as a bigger stage. Larger footprints also make map space and placement matter, which is the Kairosoft feel GAME-DESIGN.md aims at.
  - Suggested solution: Make Balai RW 2x2 first. Then pick a few more from: Posyandu, Pasar Kaget and Portal (RW), Kantor RT, Indomaret and Alfamart, Kos-kosan, Bank Sampah, Parkir. Keep one size per stage tier so the ladder reads clearly. For each: set its footprint, redraw its sprite at the larger size per ART.md (draw at the real size with `new Painter(n)`, stay inside the footprint and the 40-pixel headroom), and re-check combo range, which already counts edge to edge. Never overwrite the artist's assets from #18; add new art or ask the artist. Check `tests/footprint.test.ts` and `content-footprint.test.ts`, and the road-access and crowding rules. Pick the candidates with Hari before building, and log them in `decisions/`.
  - Source: Hari, 2026-10-28
  - `open · — · — · done when:` Balai RW is 2x2 with new art per ART.md, the agreed extra buildings are larger with art, the footprint tests and combo tests pass, nothing clips at 320px, and the artist's sprites are untouched.

- [ ] **Show the combo's buildings on the combo pop-up.**
  - Problem: The "Combo: ..." fanfare card (`discoverCombos` in `src/sim/combos.ts`, shown by `showModal` in `src/app.ts`) is text only: the story, the effect and "Tercatat di Combo". It does not show which buildings made it.
  - Why: The player cannot see what triggered the combo, so it is hard to learn or repeat. A picture of the buildings teaches it at a glance.
  - Suggested solution: Add the members' sprites in a row under the title, joined by "+", at the level they stand (for example Warung + Koperasi). Reuse `members()` from the Buku Combo in `src/ui/lists.ts` and pass it as the notice's `extra` (the combo fx needs the combo id or the member defs and levels). Sprites only, no new art. Keep the card within UI.md rules 5 and 8 at 320px.
  - Source: Julian, 2026-10-29
  - `open · — · — · done when:` every combo pop-up shows its member buildings as sprites under the title, nothing clips at 320px in ID, and an e2e test covers it.

## Done

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
- [ ] **Skip screenshot baselines outside CI's image.**
  - Problem: Local `npm run e2e` always fails `visual.spec.ts` because fonts render differently.
  - Why: The noise hides real failures.
  - Suggested solution: Skip it unless `CI` is set, or say so in the run output.
  - Source: local runs
  - `open · — · — · done when:` local `npm run e2e` no longer fails on visual baselines.
- [ ] **Tune `GRADE_BONUS`.**
  - Problem: The economy may feel thin after grade bonuses went half-yearly.
  - Why: Less income per year than before.
  - Suggested solution: Playtest, then adjust `GRADE_BONUS` if it feels thin.
  - Source: `decisions/41-half-year-report-night-tint.md`
  - `open · — · — · done when:` the economy is playtested and `GRADE_BONUS` is kept or tuned, with a note in `decisions/`.
