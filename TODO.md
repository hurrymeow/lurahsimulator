# TODO

Open tasks and ideas that are not done yet. Each item has a Problem, a Why and a Suggested solution, then a claim line: `[ ] status · owner · claimed date · done when`. Write all four when you add an item, so the next agent needs no context. To claim one, set status to `claimed`, add your name as owner and today's date, then open a PR. When it merges, move the item to Done. Add any open work you find or leave behind. Shipped work goes in `progress/`, decisions in `decisions/`.

## Tasks

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
- [ ] **Reword "Bangun Rumah untuk tambah kamar" in the goal strip.**
  - Problem: The line (`goal.short.beds`) makes no sense in Indonesian. EN is "Now: build a Rumah for more beds."
  - Why: The player does not learn that houses raise the population cap and attract residents.
  - Suggested solution: Reword in `src/i18n/id.ts` and `en.ts` to say build a house to raise the population cap or attract residents. Keep it short at 320px.
  - Source: Hari, 2026-10-28
  - `open · — · — · done when:` the beds goal reads clearly in ID and EN and fits at 320px.
- [ ] **Rename the menu entry "Kas & peringkat" to "Peringkat".**
  - Problem: `menu.stats` in `src/i18n/id.ts` is too long.
  - Why: Longer labels clip and add noise.
  - Suggested solution: Shorten to Peringkat and keep the EN label matching.
  - Source: Hari, 2026-10-28
  - `open · — · — · done when:` the menu says Peringkat in ID, EN has the matching short label, and nothing clips at 320px. Both languages checked.
- [ ] **Rename "Buku Combo" to "Combo".**
  - Problem: "Buku Combo" appears in `menu.combo`, `how.4.body`, `combo.noticeBody` and `src/ui/lists.ts`.
  - Why: Hari wants the shorter name.
  - Suggested solution: Search `src/i18n/id.ts` and `en.ts` for every use and rename. Check `decisions/resource-names.md`.
  - Source: Hari, 2026-10-28
  - `open · — · — · done when:` "Buku Combo" no longer shows to the player in ID or EN. Both languages checked.
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

## Done

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
