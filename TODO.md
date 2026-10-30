# TODO

Open tasks and ideas that are not done yet. Each item has a Problem, a Why and a Suggested solution, then a claim line: `[ ] status · owner · claimed date · done when`. Write all four when you add an item, so the next agent needs no context. To claim one, set status to `claimed`, add your name as owner and today's date, then open a PR. When it merges, move the item to Done. Add any open work you find or leave behind. Shipped work goes in `progress/`, decisions in `decisions/`.

## Tasks

- [ ] **Later buildings cost more, do more and look bigger.**
  - Problem: Most buildings are 1x1 at any stage, and late unlocks are not clearly pricier, stronger or more distinct than early ones. Related: "Add more buildings bigger than 1x1, starting with Balai RW at 2x2".
  - Why: Each star should feel like a step up you can see on the map, as in Kairosoft's builders.
  - Suggested solution: Set a ladder by unlock tier: start 1x1 and cheap, RT stars 1x1 to 2x2, RW 2x2, Kelurahan 2x2 to 3x3, with cost and effect rising per tier (for example x2 cost, x1.5 effect per tier). Audit every building's cost, effect and footprint against the ladder in one table, and pick changes with Hari before building. New art per ART.md at the real footprint; never overwrite the artist's sprites. Check `tests/footprint.test.ts`, `tests/content-footprint.test.ts` and the balance tests.
  - Source: Julian, 2026-10-29
  - Hari approved the proposed ladder (Oct 30). First pass shipped in #173: Apotek, Koperasi, Bengkel, Pasar Kaget prices and sizes. Next: the rest of the table, then a balance pass.
  - `claimed · voidinside99 · 2026-10-30 · done when:` a table of every building's tier, cost, effect and size is agreed with Hari, the changes ship with art per ART.md, and the footprint and balance tests pass.
- [ ] **Stat icons PR 2.**
  - Problem: After the stat-icon renderer in `progress/stat-icons.md`, buildings, inspector, events, jobs, staff, mangkrak, calo, Wacana and Realisasi still need verification and fixes.
  - Why: The renderer iconifies stat words everywhere, so sentences that read oddly with an icon noun, and slang uses that must stay words, will leak until they are checked.
  - Suggested solution: Verify and fix those screens, reword icon-noun sentences, and check the "Lubang Viral" / "Viral Pothole" title.
  - Source: `decisions/stat-icons.md`
  - `claimed · voidinside99 · 2026-10-30 · done when:` those screens are verified in ID, with no icon-noun leaks and no slang replaced.
- [ ] **Stat icons PR 3.**
  - Problem: Stage goals, Kelurahan and RW goals, stats explainer, How to play and report card still need the stat-icon check.
  - Why: Those screens carry stat words in goals and explanations, where an icon alone can lose meaning.
  - Suggested solution: Check those screens, keeping one word-plus-icon legend in the stats explainer.
  - Source: `decisions/stat-icons.md`
  - `claimed · voidinside99 · 2026-10-30 · done when:` those screens are verified in ID, with the explainer legend kept.

- [ ] **Playtest the Kelurahan, then decide on Kecamatan and above.**
  - Problem: Only stages 1 to 3 are specified.
  - Why: Nothing past the Kelurahan is designed, and the Kelurahan has not been played end to end.
  - Suggested solution: Playtest the Kelurahan, then write up what Kecamatan and above should be.
  - Source: GAME-DESIGN.md section 1 and section 7
  - `claimed · voidinside99 · 2026-10-30 · done when:` the playtest is done and Hari has decided on Kecamatan and above.
- [ ] **Add more buildings that raise Popularitas, so it is not just Pos Ronda.**
  - Problem: Few buildings give Popularitas (hearts) each month. In `src/data/buildings.ts` Pos Ronda is the clear source (`perMonth: {{ sabar: 2 }}`), and a few combos add some (`src/data/combos.ts`). Not a full audit.
  - Why: The player builds Pos Ronda again and again for hearts, so the town looks the same and choices are not interesting. Popularitas gates arrivals and stars.
  - Suggested solution: List every building's Popularitas per month, then add a handful of social buildings (for example a mosque or langgar, a posyandu-like clinic, a small park) with different size, cost and side effects. Keep the 25-word blurbs and follow ART.md (the artist's sprites stay). Rebalance with the economy and bot tests, and pick the set with Hari first.
  - Source: Hari, 2026-10-29
  - `claimed · voidinside99 · 2026-10-30 · done when:` at least 3 new buildings give Popularitas with different costs or trade-offs, Pos Ronda is no longer the only good source, the economy and bot tests pass, and new art follows ART.md.
- [ ] **Redo the staff page UI so it has far fewer buttons.**
  - Problem: The staff page (`src/ui/staff.ts`, about 150 lines) shows many buttons per person and per channel: raise, bimtek, fire, hire, post by channel.
  - Why: Hari finds it overwhelming, and says Kairosoft handles staff with one card per person and one main action.
  - Suggested solution: Study the Kairosoft staff screen, then show one card per person with a single main button and put the other actions behind a detail view. Follow UI.md. Draft the layout with Hari before building.
  - Source: Hari, 2026-10-29
  - `claimed · voidinside99 · 2026-10-30 · done when:` the staff page has one primary action per card, rare actions sit in a detail view, nothing clips at 320px in ID and EN, and an e2e test covers hire, raise and fire.
- [ ] **Replace 'Kini: do xx' with the pending goals for the next star.**
  - Problem: The goal strip (`shortGoal` in `src/sim/nextstep.ts`) shows one 'Kini: ...' action. Hari does not like it and would rather see what is left for the next star (screenshot: 'Kini: capai 60 warga.').
  - Why: A single line hides the star checklist, and it sometimes names a minor step. The player wants to see the real target.
  - Suggested solution: Show the pending goals for the next star (the unmet ones, with have and need) in the strip or its expanded view, and keep one next action only when it helps. Check UI.md, the Now and Next star strip, and the combo-priority item. Draft the strip with Hari before building.
  - Source: Hari, 2026-10-29. Related: "Put the combo goal ahead of 'build a house' in the goal strip"
  - `claimed · voidinside99 · 2026-10-30 · done when:` the strip shows the pending goals for the next star in ID and EN, nothing clips at 320px, and the pacing e2e still passes.
- [ ] **Slow the Kelurahan down and make its stars read the player's own kampung.**
  - Problem: In the bot playtest the Kelurahan reached 3★ in 11 to 15 minutes at 1x (target about 30). Every star waited only on "every RW at N★", which Dana buys, while the player's own Popularitas sat at 0 and their kampung shrank to 2 to 9 residents.
  - Why: The Kelurahan plays itself once it is funded, and a Lurah can win with an empty kampung.
  - Suggested solution: Add goals that read the player's own kampung (Popularitas and residents) to Kelurahan 1★ to 3★, and retune with `tests/kel-bot.test.ts` toward the 30-minute target. Pick the goals with Hari.
  - Source: `decisions/kelurahan-playtest.md`, findings 1 to 3
  - `open · — · — · done when:` each Kelurahan star needs something from the player's own kampung, and the Kelurahan bot's 3★ lands near 30 minutes at 1x.
- [ ] **Sejahtera must not reward an empty kampung.**
  - Problem: The 2045 meter read 86 to 100 with 2 to 9 residents, because Perut and Kerja are full when almost nobody needs feeding or work.
  - Why: Sidang Emas 2045 compares Sejahtera with the Laporan. An empty kampung would score as Pahlawan.
  - Suggested solution: Weight Sejahtera by households, or floor it by population against the stage's target, so a tiny kampung cannot read high. Check `src/sim/needs.ts` and the Sidang Emas endings.
  - Source: `decisions/kelurahan-playtest.md`, finding 4
  - `open · — · — · done when:` a kampung under the stage's resident target cannot show Sejahtera above a set ceiling, with a unit test.
- [ ] **Cap Studi Banding.**
  - Problem: Studi Banding has no `maxCount`, and each one counts as spent toward Serapan. The bot built more than 60 and filled the seams.
  - Why: Spamming it is the cheapest way to Serapan, and it buries the Kelurahan map.
  - Suggested solution: Give it a `maxCount` (for example 2), or make it a one-off action in Anggaran instead of a building.
  - Source: `decisions/kelurahan-playtest.md`, finding 5
  - `open · — · — · done when:` Studi Banding cannot be built without limit, and the Kelurahan bot still reaches its stars.
- [ ] **Decide on Kecamatan and above from the playtest.**
  - Problem: `decisions/kelurahan-playtest.md` proposes Kecamatan (a ring of districts, Musrenbang, pinjol and judol) and one line for each stage above. Hari has not decided.
  - Why: GAME-DESIGN.md section 2 waits on this before Kecamatan is specified.
  - Suggested solution: Hari answers the four questions at the end of the playtest doc; then section 2 gets a Kecamatan entry.
  - Source: `decisions/kelurahan-playtest.md`
  - `open · — · — · done when:` Hari has decided, and GAME-DESIGN.md section 2 specifies Kecamatan.
- [ ] **Make the dev seeds look like a proper city.**
  - Problem: The developer seeds (#158, `src/sim/seeds/*.json`, `decisions/dev-seeds.md`) load a messy town. They come from a plain bot (`tests/seed-bot.ts`) that builds everything placeable, so buildings land at random spots with no clear roads and little variety. Hari, 2026-10-30.
  - Why: The seeds exist to test higher stages quickly. A messy map hides layout, road-access, crowding and art problems, and it is no use for screenshots or playtests of how a late game should look.
  - Suggested solution: Change the seed bot, or hand-lay the seeds, so each one looks planned: a built road grid with Jalan Setapak linking every building, houses in blocks, shops along the roads, decor and parks in gaps, and a mix of all unlocked buildings and levels (not many copies of a few). Keep the star and resident counts the seeds have now. Rebuild with `SEED_WRITE=1 npx vitest run tests/seed.test.ts` and add a check that the seed has no unreachable buildings and uses a minimum number of different building kinds. Check one screenshot per seed at 390px before merging.
  - Source: Hari, 2026-10-30. Related: "Let AI RTs build many more kinds of building".
  - `open · — · — · done when:` each seed shows roads linking every building, a mix of many building kinds and levels in a tidy layout, the star and resident counts are unchanged, the seed tests pass, and a screenshot of each seed was checked.

## Done

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
