# Plan: fix every screen that fails the UI audit of 2026-11-01

Status: approved by Hari 2026-11-01 ("plan fix for everything and add to todo"). Audit: project file `audit/ui-rules-2026-11-01/report.md` (screenshots per width and language beside it). Rules: UI.md 5, 7, 10, 13 to 17.

Revised 2026-11-01 for the DeepSeek executor (Hari approved running T6 to T11 there): T6 to T8 rewritten with exact files and layouts; Stats, How to play and toasts split out as T12 to T14; Neighbours dropped (own revamp plan).

## Goal

Every screen passes UI.md at 320, 360, 412 and 430px in EN and ID, and CI proves it.

## What is already planned elsewhere

| Fail | Covered by |
| --- | --- |
| Rule 14 on setup, dock, Build and Warga tabs, Settings choices | `docs/plans/ui-hierarchy.md` T1 (PR #225) and T3 |
| Wacana (rules 13, 14) | `docs/plans/ui-hierarchy.md` T2 |
| Goal pill (rules 5, 16) | `docs/plans/goal-line-one-goal.md` |
| CI word-count and one-primary scan | `docs/plans/ui-hierarchy.md` T5 |
| Neighbours sheet (rule 13) | TODO.md "Neighbours sheet revamp" and its own planning thread |

This plan covers everything else, and adds to T5.

## Decisions and why

1. **Event choices are all secondary.** A choice between alternatives has no "step forward", so rule 14 gives none of them the primary fill. The result pop-up's single "OK"-style button stays primary. Why: today 2 of 3 choices are filled, which tells the player which one to pick.
2. **Toasts lead with the fact in 8 words or fewer.** Rule 16 covers tappable notices too. The toast shows the title, plus the body only when both fit in 8 words. Example: "Bu Fajar pergi: ❤ di bawah 15". The full line stays in the Log. Why: the toast is tappable and was 12+ words.
3. **Combo card effects fit in 2 lines with no clamp.** The effect is rewritten, not cut. `data-clamp` support is removed from the code and from the legibility scan once the goal pill also stops clamping. Why: rule 5 now has no exceptions.
4. **Lists show one line per row; detail opens on tap.** Applies to Build cards, Staff and Stats. Neighbours moved to its own revamp plan. Why: rule 13; the detail screen is the second disclosure level, which rule 13 allows.
5. **The opener is one idea per card, 20 words or fewer each.** Long explanations move to How to Play. Why: rule 7; today the opener shows 95 to 113 words.
6. **The expanded goal list closes when a sheet opens.** Why: in the audit it stayed open over every sheet after one tap. Verify first; it may be a crawl artefact.
7. **Build detail opens from an info button, not a long-press.** The card stays one tap to place, so the tutorial and muscle memory are unchanged. A long-press is undiscoverable on a phone.
8. **Staff actions live in the person view.** The list row shows a chip when a raise is asked, so nothing urgent hides. Training costs one extra tap.
9. **The How to play guide is an index.** Headings only; a tap opens a step. The opener keeps full text but in about 45 words. Why: paging would need all 11 bodies rewritten and changes every test that taps Got it once.

## Tasks

Order: run T6, T7, T8, T12, T13 and T14 one at a time, and merge each before dispatching the next: most of them delete a line from `DENSITY_ALLOW`, so parallel PRs conflict. T13 needs T8. T9 can run any time. T10 waits for T6 to T8, T12 to T14 and hierarchy T5. T11 runs last. Task ids skip to T12 because the executor takes `T<number>` only.

### T6. Build cards: one line per card (Sonnet, executor trial)
- Files: `src/ui/build.ts`, `src/style.css`, `src/i18n/en.ts`, `src/i18n/id.ts`, `tests/e2e/ui.spec.ts`
- Exact changes:
  - Card layout. In `openBuild`, the `card` function returns `h('div', { class: 'build-row' }, cardBtn, infoBtn)`. `cardBtn` is today's `button.card-btn` (same classes, `aria-disabled` and `onclick`) holding only: the sprite; `div.card-title` with name, NEW tag and `span.cost` (unchanged); one `p.owned` line with `ownedLabel(s, d)` and, when `d.housing`, a 16px house icon (`menuIconURL('build')`, `alt=""`) plus the bare number `d.housing`. Locked cards add `missingList(missing.slice(0, 1))` below, so one reason only.
  - Remove from the card: `bBlurb(d)`, the `meta` line (size, permit or no permit, `populationBits`). Delete `populationBits` if nothing else uses it.
  - `infoBtn`: `h('button', { class: 'btn-icon build-info', type: 'button', 'aria-label': t('build.info', { name: bName(d) }), onclick: () => showDetail(d) }, 'i')`.
  - `showDetail(d)` follows the `showCombos` pattern: save `buildTop`, then `openSheet(bName(d), body, onClosed, back)` with the same `‹ ` + `t('build.title')` back button calling `showBuild`. `body`, in order: `spriteImg(d.sprite, 64)`; `p` with `rupiah(cost)` and `ownedLabel`; `p` with `bBlurb(d)`; `p.meta` with size and permit or no-permit (today's `meta` strings); `p.meta` with `t('build.houses')` and `t('build.attracts')` when they apply; if locked, the full `missingList(missing)`, else one `button.btn.btn-primary#build-place` with `t('page.place')` that calls `app.startPlacing(d.id)`.
  - CSS in `src/style.css` beside `.card-btn`: `.build-row { display: flex; gap: 8px; margin-bottom: var(--gap); }`, `.build-row .card-btn { flex: 1; min-width: 0; margin-bottom: 0; }`, `.build-info { flex: none; width: var(--touch); min-height: var(--touch); }`, `.card-btn .owned img { vertical-align: middle; margin-left: 6px; }`.
  - New strings: EN `build.info`: `About {name}`. ID `build.info`: `Tentang {name}`.
  - In `tests/e2e/ui.spec.ts`: delete the four `build`, `build tab 2`, `build tab 3`, `build tab 4` entries from `DENSITY_ALLOW`. Add one test named `the build info button opens the detail and places from it` beside `build cards show how many are owned`: open Build, tap the Rumah row's `.build-info`, expect `#sheet` to contain the Rumah blurb and `#build-place`; tap `#build-place`, expect placing mode (the same check the existing build tests use after tapping a card).
- Done when: `npm run typecheck` and `npm test` pass; `npx playwright test tests/e2e/ui.spec.ts -g "build cards|build info|first Rumah|word and primary-button limits" --project=phone-320-id --project=phone-430-id --project=phone-430-en` passes. If the density test still fails on a Build tab, set status `stopped` with the counts. Do not shorten names or add allowlist caps.
- Don't touch: prices, unlocks, sort order, tabs, the head lines (`pop.line`, `stage.next`), the Combo book button, the tutorial coach targets (`.card-btn` stays the tappable card), TODO.md.

### T7. Staff list: one line per person (Sonnet, executor trial)
- Files: `src/ui/staff.ts`, `src/style.css`, `src/i18n/en.ts`, `src/i18n/id.ts`, `tests/e2e/ui.spec.ts`
- Exact changes:
  - `staffCard` keeps `div.card-btn.static.staff-card` (and `.inem`, `data-staff`), `face(x)` and the `button.staff-open` with only two children: `span.card-title` (name, `staff.level`) and `span.meta` with `staff.roleLine`. Remove from the card: the `staff-work` line, the salary line, `flags(x)`, the `raiseAsk` paragraph and the main action (Bimtek or Give the raise). Drop the `done` parameter if it becomes unused.
  - Add one chip after the button, at most: `h('p', { class: 'meta warn staff-chip' }, text)`, where text is `t('staff.raiseChip')` when `x.raiseAsked`, else `t('staff.awayNow', { n: x.away })` when `x.away`, else `t('staff.refusedChip')` when `x.refused`, else no chip.
  - The person view (`personView`) is unchanged: Give the raise, Refuse, Bimtek courses, Mutasi and Let go all stay there.
  - In `openStaff`'s list, remove the `staff.intro` paragraph. In `lowongan`, remove `h('p', {}, roleBlurb(r))` from each open-role card; the post view already shows the blurb. Delete `staff.intro` from both dictionaries if nothing else uses it.
  - New strings: EN `staff.raiseChip`: `Wants a raise`, `staff.refusedChip`: `Raise refused`. ID `staff.raiseChip`: `Minta naik gaji`, `staff.refusedChip`: `Kenaikan ditolak`.
  - CSS: `.staff-chip { margin: 4px 0 0; }` beside the other `.staff-` rules in `src/style.css`.
  - In `tests/e2e/ui.spec.ts`: delete the `staff` entry from `DENSITY_ALLOW`. In the test `each staff card has one main button; raise and let go work from the card and its detail view`, rename it to `each staff row opens its detail; raise and let go work there`, and replace `await hired.locator('.btn-primary').click();` with `await expect(hired.locator('.staff-chip')).toBeVisible(); await hired.locator('.staff-open').click(); await page.locator('#sheet .staff-actions .btn-primary').click();`. Delete the second `await hired.locator('.staff-open').click();` (the view stays on the person after the raise). Keep the `toBeLessThanOrEqual(1)` button check.
- Done when: `npm run typecheck` and `npm test` pass; `npx playwright test tests/e2e/ui.spec.ts -g "Staff|staff|word and primary-button limits" --project=phone-320-id --project=phone-430-id --project=phone-430-en` passes. If the density test still fails on `staff`, set status `stopped` with the counts and say which block is largest.
- Don't touch: hiring, applicants (`staff-applicant` cards), channels, the Mimpi section, sim maths, the person view, TODO.md.

### T8. Opener: short lines (Haiku)
- Files: `src/i18n/en.ts`, `src/i18n/id.ts`
- Exact changes: replace these eight strings, keeping each key and placeholder.
  - EN `how.intro`: `Welcome, {pt} {pn}. Beat Kampung Sebelah.`
  - EN `how.1.body`: `Tap Build, pick one, tap a spot, Place.`
  - EN `how.8.body`: `A week is 8 seconds. Pause or speed up above.`
  - EN `how.later`: `More tips as you play. Full guide in Menu.`
  - ID `how.intro`: `Selamat datang, {pt} {pn}. Kalahkan Kampung Sebelah.`
  - ID `how.1.body`: `Ketuk Bangun, pilih satu, ketuk petak, lalu Pasang.`
  - ID `how.8.body`: `Seminggu 8 detik. Jeda atau percepat lewat tombol di atas.`
  - ID `how.later`: `Tips lain muncul saat bermain. Panduan lengkap di Menu.`
- Done when: `npm run typecheck` and `npm test` pass; `npx playwright test tests/e2e/ui.spec.ts -g "how to play|tips|first Rumah" --project=phone-320-id --project=phone-412-en` passes. The opener then counts about 47 words in view in EN and 43 in ID, each step 15 or fewer.
- Don't touch: headings (`how.N.head`), other `how.*` bodies, `src/ui/howto.ts`, the tutorial tap lock, tip timing, `DENSITY_ALLOW` (T13 removes `howto`), TODO.md.

### T12. Stats: numbers first, explainers behind a tap (Haiku)
- Files: `src/app.ts`, `src/style.css`, `src/i18n/en.ts`, `src/i18n/id.ts`, `tests/e2e/ui.spec.ts`
- Exact changes:
  - In `openStats` in `src/app.ts`: delete the `h('p', {}, t('stats.intro'))` line. Show only the latest 4 ranking rows (`ranks.slice(0, 4)`). After the ranking rows, append `h('details', { class: 'stats-how' }, h('summary', {}, t('stats.how')), h('p', { class: 'meta' }, t('stats.emasHow')), h('p', { class: 'meta' }, t('stats.scoreHow')))`.
  - Strings, EN: `stats.emas`: `{n}% done`. `stats.score`: `Your score now: {n}`. New `stats.how`: `How it works`. New `stats.emasHow`: `Emas: policies, year ends and ranking wins raise it. Frozen projects lower it.` New `stats.scoreHow`: `Score: every 12 weeks, from residents, working buildings, combos, Popularitas and Emas.` Delete `stats.intro`.
  - Strings, ID: `stats.emas`: `{n}% tercapai`. `stats.score`: `Skormu sekarang: {n}`. New `stats.how`: `Cara kerjanya`. New `stats.emasHow`: `Emas: Wacana, pergantian tahun dan menang peringkat menaikkannya. Proyek mangkrak menurunkannya.` New `stats.scoreHow`: `Skor: tiap 12 minggu, dari warga, bangunan berjalan, combo, Popularitas dan Emas.` Delete `stats.intro`.
  - CSS in `src/style.css`: `.stats-how summary { min-height: var(--touch); display: flex; align-items: center; cursor: pointer; font-weight: 700; }`.
  - In `tests/e2e/ui.spec.ts`: delete the `stats` entry from `DENSITY_ALLOW`.
- Done when: `npm run typecheck` and `npm test` pass; `npx playwright test tests/e2e/ui.spec.ts -g "stats sheet|word and primary-button limits" --project=phone-320-id --project=phone-430-id --project=phone-430-en` passes. If it fails on `stats`, set status `stopped` with the counts.
- Don't touch: ranking maths, `stats.totals`, `stats.usThem`, other sheets, TODO.md. No refactors.

### T13. How to play guide: headings only, tap to open (Sonnet, executor trial)
- Runs after T8 is merged.
- Files: `src/ui/howto.ts`, `src/style.css`, `tests/e2e/ui.spec.ts`
- Exact changes:
  - In `showHowto`, only when `basicsOnly` is false (the Menu guide): leave out the `how.intro` paragraph, and render each step as `li` > `button.how-row` (`type="button"`, `aria-expanded="false"`) holding `b` with `stepHead(s)`, then `div.how-body[hidden]` holding `picRow(s)` and `p` with `stepBody(s)`. Tapping the row toggles `hidden` on its own body and flips `aria-expanded`. Other rows stay as they are.
  - The opener (`basicsOnly` true) keeps today's markup: picture row, bold head and body, `how.intro` and `how.later`.
  - `#howtoGo` stays the one `.btn-primary` and closes the guide from any scroll position.
  - CSS: `.how-row { display: block; width: 100%; min-height: var(--touch); text-align: left; font: inherit; color: var(--text); background: none; border: 0; border-bottom: 1px solid var(--line); padding: 8px 0; cursor: pointer; }` and `.how-body { padding: 8px 0; }`.
  - In `tests/e2e/ui.spec.ts`: delete the `howto` entry from `DENSITY_ALLOW`. In the test that opens How to play from the Menu (it expects more than 5 `#howto .steps li`), add: every `#howto .how-body` is hidden; click the first `.how-row`; its `.how-body` is visible and `aria-expanded` is `true`.
- Done when: `npm run typecheck` and `npm test` pass; `npx playwright test tests/e2e/ui.spec.ts -g "how to play|tips|first Rumah|word and primary-button limits" --project=phone-320-id --project=phone-430-id --project=phone-430-en` passes. If `howto` still exceeds 50 words in view in any of those, set status `stopped` with the count; do not cut headings.
- Don't touch: `STEPS`, tip cards (`src/ui/tips.ts`), strings, the tutorial tap lock, TODO.md.

### T14. Toasts: the fact in 8 words or fewer (Sonnet, executor trial)
- Files: `src/format.ts`, `src/app.ts`, `src/sim/tick.ts`, `src/i18n/en.ts`, `src/i18n/id.ts`, `tests/toast.test.ts`
- Exact changes:
  - Add to `src/format.ts`: `export function toastParts(title: string, body: string): [string, string]`. Count words as runs containing a letter (`/\p{L}/u`, the same rule as `tests/e2e/density.ts`). Return `['', body]` when `title` is empty, `[title, body]` when title and body together are 8 words or fewer, else `[title, '']`.
  - In `notice()` in `src/app.ts`: build the ticker from `toastParts(n.title, n.body)`: `strong` with the title part, then `span` with the body part only when it is not empty. `this.log.unshift(n)` stays as is, so the Log keeps the full notice.
  - `sim.movedOut` carries its reason. EN: `{name} left: Popularitas under {n}`. ID: `{name} pergi: Popularitas di bawah {n}`. In `src/sim/tick.ts`, pass `n: LEAVE_BELOW_SABAR` to that `t('sim.movedOut', …)` call. `sim.movedOutBody` is unchanged.
  - New `tests/toast.test.ts`: the three `toastParts` cases, plus `sim.movedOut` in EN and ID at 8 words or fewer with placeholders filled by one word.
- Done when: `npm run typecheck` and `npm test` pass; `npx playwright test tests/e2e/ui.spec.ts -g "toast|neighbour" --project=phone-320-id --project=phone-412-en` passes; the PR body lists every `kind: 'notice'` and `.notice({` title key with its EN and ID word count (all are 8 or fewer today; set status `stopped` if one is not).
- Don't touch: modal notices (`fanfare` or `card`), the Log screen, toast timing, other strings, TODO.md.

### T9. Events and Combo cards (Haiku)
- Files: event pop-up renderer (grep `card event` in `src/ui/`), `src/ui/lists.ts` line with `data-clamp': '2'`, combo effect strings in `src/data/` combos.
- Exact changes: event choice buttons use `.btn` (secondary), not `.btn-primary`; the result button stays primary. Remove `data-clamp` from the Combo effect span and shorten any effect that runs past 2 lines at 320px ID.
- Done when: 0 primary buttons on an event choice card; no Combo card clamps at 320px ID; event and Combo specs green; `--project=phone-412-en` run for the touched specs.
- Don't touch: event outcomes, combo maths, the goal pill clamp (goal-line plan). No refactors.

### T10. Rule checks in CI (Sonnet, extends hierarchy T5)
- Files: `tests/e2e/ui.spec.ts`, `tests/e2e/legibility.ts`, a canvas test file for rule 17, `UI.md` table.
- Add: rule 10 (at each tutorial step, tap outside the target, assert no state change); rule 15 (list each tab set and its item type, fail on a mixed set); rule 16 (pills, chips, buttons and toasts at 6 to 8 words, card rows excluded); rule 17 (place each building type on a clear map, diff neighbouring tiles before and after). Remove the `data-clamp` skip from the legibility scan once the goal pill and Combo cards stop clamping.
- Done when: the checks run in CI and pass, or fail only on allowlisted screens with a TODO link.
- Don't touch: other specs.

### T11. Re-audit (Sonnet)
- Rerun the crawl in the project files (`audit/ui-rules-2026-11-01/audit.spec.ts`) at 320, 360, 412 and 430px, EN and ID, in light and dark theme, on the RT, Kelurahan and Kecamatan seeds.
- Done when: a new report in the project files shows every screen passing, or lists the remaining fails as TODO items.

## Open questions

- None blocking. If a Build card can't fit one effect line at 320px ID with icons, report back with the worst case rather than shrinking text.
