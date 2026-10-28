# TODO

Open tasks and ideas that are not done yet. Each task reads `[ ] status · owner · claimed date · done when`. To claim one, set status to `claimed`, add your name as owner and today's date, then open a PR. When it merges, move the item to Done. Add any open work you find or leave behind. Shipped work goes in `progress/`, decisions in `decisions/`.

## Tasks

- [ ] **Desa ring.** The sawah and kebun ring on the Desa path is not built. Source: GAME-DESIGN.md section 7, `progress/desa-path.md`, `progress/kelurahan-playable.md`.
  `open · — · — · done when:` the sawah and kebun ring is built on the Desa path.
- [ ] **Kelurahan 2★ and 3★ balance.** `tests/kel-bot.test.ts` only checks 1★. Add bot runs for 2★ and 3★ and tune until they pass. Source: `progress/kelurahan-playable.md`.
  `open · — · — · done when:` `tests/kel-bot.test.ts` has bot runs for 2★ and 3★ and they pass.
- [ ] **RW 3★ balance.** Unchecked, because it needs 2 AI RTs at 3★. Source: `progress/rw-playable.md`.
  `open · — · — · done when:` RW 3★ is checked with 2 AI RTs at 3★ and tuned to pass.
- [ ] **Human-timed run for pacing targets 1 and 10.** First house within 30s of New Game is only an estimate (25 to 35s). Star unlock affordability is not measured. Source: GAME-DESIGN.md section 3, Open work.
  `open · — · — · done when:` a human-timed run measures first house and star unlock affordability.
- [ ] **Playtest the Kelurahan, then decide on Kecamatan and above.** Only stages 1 to 3 are specified. Source: GAME-DESIGN.md section 1 and section 7.
  `open · — · — · done when:` the playtest is done and Hari has decided on Kecamatan and above.
- [ ] **Range checks from top corners.** Combos now measure range edge to edge (`decisions/combo-range-and-move-look.md`), but the minimarket Kanibal penalty (`src/sim/brands.ts`) and decoration boosts (`src/sim/state.ts`) still measure from each lot's top corner, so a 2x2 or 3x3 neighbour counts as farther than it looks. Switch them to the same edge-to-edge rule.
  `open · — · — · done when:` the Kanibal penalty and decoration boosts use the edge-to-edge rule.
- [ ] **Flaky walkers e2e.** `walkers and effects › residents walk the map and ojol riders join them` (`tests/e2e/ui.spec.ts`) fails about 1 run in 4 locally on main too, at 320px id and 430px en. Find the race and make it robust.
  `open · — · — · done when:` the walkers e2e passes reliably on main at 320px id and 430px en.

- [ ] **Say why the population stalls.** Arrivals need population below attraction (`attractTarget` in `src/sim/state.ts`). The HUD chip shows beds (`13/15`), so a stall at attraction 12 looks like a bug. When population is at or above attraction, `shortGoal` (`src/sim/nextstep.ts`) should say what to add, for example a Warung. Keep it out of the 320px chip. Source: 16-min playtest, 2026-10-28.
  `open · — · — · done when:` `shortGoal` says what to add when population is at or above attraction, and the 320px chip is unchanged.
- [ ] **Explain big drops in the 2045 meter.** The meter is the average of Perut, Kerja and Aman (`src/sim/needs.ts`). A Warung that loses its road or gets damaged leaves `isWorking`, so Perut falls and the meter jumps (58 to 22 in the playtest). Show a toast naming the cause when the meter drops 10 points or more. Not verified against a replay. Source: 16-min playtest, 2026-10-28.
  `open · — · — · done when:` a toast names the cause when the meter drops 10 points or more.
- [ ] **Force the update with a full-screen screen.** The update banner (`src/pwa/update.ts`) stays all session unless clicked. Hari wants a forced update: a full-screen "Update now" screen with one button, not a dismissible banner. Decide when it shows (home only, so play never reloads mid-session). Source: 16-min playtest, 2026-10-28.
  `open · — · — · done when:` a full-screen "Update now" screen replaces the banner, at a point Hari agrees.
- [ ] **Review the Bahasa Indonesia UI text (not event content).** Find untranslated English, stiff or awkward phrasing, inconsistent terms, clipped text and overlong labels. Suggest fixes in a table of current text, suggested text and why, and wait for Hari to pick before any code. Plan:
  `open · — · — · done when:` Hari has picked fixes from the table and one PR with the string edits is merged, with `npm run e2e` (id and en) green.
  1. Run the app in `id` with Playwright, mobile portrait, at 320 and 412px. Reuse the crawl in `/mnt/project-files/audit/crawl/` (`audit.spec.ts`, `tut.spec.ts`).
  2. Walk every screen: HUD, Menu, the 4 Build tabs, building and tile panels, Settings, Buku Combo, report card, tips and home. Skip event popups.
  3. Dump each visible string with its screen and width. Flag clipped text by `scrollWidth > clientWidth` and by screenshot at 320px.
  4. Cross-check the strings against `src/i18n` for English left in `id`, and against `decisions/resource-names.md`. Keep the deliberate names (for example Orang Dalam).
  5. Skip stat words. The icons-for-stats plan (`/mnt/project-files/plans/icons-for-stats-plan.md`) replaces them with icons.
  6. Return the table to Hari. After Hari picks, edit strings in one PR, run `npm run e2e` (id and en), and log the choices in `decisions/`.
- [ ] **Fit the tutorial dialogue to the game column on desktop.** On a desktop browser the tutorial dialogue bar (Inem) spans the whole window instead of the centred game column, so it sits detached from the game. The screenshot also shows a Skip button, but tip cards have no Skip, only "Tap to continue" (see AGENTS.md and UI.md). Source: Hari, 2026-10-28.
  `open · — · — · done when:` the dialogue fits the game column at desktop widths, has no Skip button, and an e2e test at a desktop viewport covers it.
- [ ] **Move Jalan Setapak into the Decor tab.** Jalan Setapak currently leads the first Build tab (`src/ui/build.ts`, the comment about leading the first tab). Hari: it can just sit in Decor. Check this against the paced tutorial, which relies on it being first (`decisions/` for Selokan and Jalan Setapak). Source: Hari, 2026-10-28.
  `open · — · — · done when:` Jalan Setapak is listed under Decor, the tutorial still points the player to it, and EN and ID e2e pass.
- [ ] **Make the pause state obvious, and freeze animation when paused.** In build mode especially, pause is easy to miss. Show the word PAUSED near the bottom of the screen. Also stop all animation while paused: trees still move. Source: Hari, 2026-10-28.
  `open · — · — · done when:` PAUSED shows near the bottom in play and build mode in EN and ID, no sprite or scenery animation runs while paused, and an e2e test covers it. Check against the existing Paused pill (build mode only).
- [ ] **Play a sound on every menu click.** Add a click sound to every menu button and tab. Source: `src/audio.ts`; respect the existing mute setting. Source: Hari, 2026-10-28.
  `open · — · — · done when:` Every menu control plays a click sound, mute silences it, and nothing doubles up with existing sounds.
- [ ] **Don't force-place the building in the centre after choosing it in Build.** After picking a building in build mode it is placed at the screen centre. That blocks the view and invites mistaps. Let the player place it where they tap, or start it off the main view. Source: Hari, 2026-10-28.
  `open · — · — · done when:` Choosing a building does not drop it in the centre, the placement target does not cover the map, and mistaps drop at 320px. e2e covers it.
- [ ] **Let the player use Orang Dalam from the building panel while it waits for a permit.** Hari could not find a way to tap a building waiting for a permit and use Orang Dalam. `src/ui/inspect.ts` already has a skip-permit button (line ~90), so find out why it was missed: tap target, panel not opening for permit buildings, or button hidden. Fix that first. Not verified. Source: Hari, 2026-10-28.
  `open · — · — · done when:` Tapping a permit building opens a panel with a clear Orang Dalam button that skips the permit, shown in EN and ID.
- [ ] **Make renaming a building hard to trigger by mistake.** Renaming (ganti nama) is easy to hit by accident. Show a pencil icon next to the building name. Only tapping the icon opens the keyboard and the rename field. See `src/ui/inspect.ts` (`nameInput`, `rename`). Follow ART.md for the icon. Source: Hari, 2026-10-28.
  `open · — · — · done when:` The name is plain text with a pencil icon beside it, only the icon opens the rename field and keyboard, and no rename field shows otherwise.
- [ ] **Tie tutorial tips to an action, not to a timer.** Hari finds the guide pop-ups random and wants a stronger "so what". In `src/ui/howto.ts` each tip has a `when` rule. Some are action-based, such as the first permit queue or the first arrival. Others use `s.month >= 3` or `>= 9`, so they are time-based: house, combo, jobs, wacana, ranking. Replace the month tests with the action that makes the tip matter, and say the reason in the tip. Source: Hari, 2026-10-28.
  `open · — · — · done when:` No tip fires on month alone, each tip fires from a player action or a state it explains, and each says what the player gains. Check against GAME-DESIGN.md section 3 and `decisions/`.
- [ ] **Reword "Bangun Rumah untuk tambah kamar" in the goal strip.** The line (`goal.short.beds`) makes no sense: it should say build a house to raise the population cap, or to attract residents. EN is "Now: build a Rumah for more beds." Edit both languages in `src/i18n/id.ts` and `en.ts`; keep the line short at 320px. Source: Hari, 2026-10-28.
  `open · — · — · done when:` The beds goal reads clearly in ID and EN and fits at 320px.
- [ ] **Rename the menu entry "Kas & peringkat" to "Peringkat".** `menu.stats` in `src/i18n/id.ts`. Check the EN label too and keep the two matching. Both languages need checking. Source: Hari, 2026-10-28.
  `open · — · — · done when:` The menu says Peringkat in ID, EN has the matching short label, and no text clips at 320px.
- [ ] **Rename "Buku Combo" to "Combo".** Used in `menu.combo`, `how.4.body`, `combo.noticeBody` and the comments in `src/ui/lists.ts`. Search both `src/i18n/id.ts` and `en.ts` for every use. Both languages need checking. Source: Hari, 2026-10-28.
  `open · — · — · done when:` "Buku Combo" no longer shows to the player in ID or EN, and the term matches `decisions/resource-names.md`.
- [ ] **Put the combo goal ahead of "build a house" in the goal strip.** Hari asks why "Kini: bangun Rumah untuk tambah kamar" outranks finding a combo, when the 1★ needs a combo. `shortGoal` in `src/sim/nextstep.ts` shows the combo goal only while `discovered.length === 0` after `COMBO_HINT_MONTH`, and the beds goal comes later, so check the order and the month. Decide what leads when both apply and log it in `decisions/`. Check against the Now and Next ★ strip and GAME-DESIGN.md section 3. Both languages need checking. Source: Hari, 2026-10-28.
  `open · — · — · done when:` When both apply, the strip leads with the combo that earns the 1★, the order is logged in `decisions/`, and the pacing e2e still passes.
- [ ] **Teach the combo mechanic in the tutorial.** Hari says there is no real tutorial on combos. Today there is a single tip (`how.4`, id `combo` in `src/ui/howto.ts`). Add a short guided step: place two buildings side by side, see the combo trigger, and find it in the Combo list. Tie it to an action (see the tip-timing item). Source: Hari, 2026-10-28.
  `open · — · — · done when:` A new player is shown how to make a combo by doing one, the step fires after an action and has no Skip, and it is covered in EN and ID.

## Done

Nothing yet.

## Ideas

- **English e2e on a schedule.** CI now runs Indonesian only (`decisions/default-lang-id.md`). A nightly or weekly workflow could run the `-en` projects so English clipping is still caught without slowing PRs.
- **Skip screenshot baselines outside CI's image.** Local `npm run e2e` always fails `visual.spec.ts` because fonts render differently. Skip it unless `CI` is set, or say so in the run output.
- **Tune `GRADE_BONUS`** if the economy feels thin after grade bonuses went half-yearly. Source: `decisions/41-half-year-report-night-tint.md`.
