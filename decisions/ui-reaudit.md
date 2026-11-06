# Full UI re-audit (T11)

TODO item "Full UI re-audit (T11)", `docs/plans/ui-audit-fixes.md` T11. The 2026-11-01 crawl lived in the project files, out of a cloud session's reach, so it was rebuilt in the repo.

## The crawl
`npm run audit:ui` (`audit/ui-audit.spec.ts`, its own Playwright config so it never runs in PR CI):
- **Where:** every screen a player reaches (home, setup, map, the open goal list, Menu and each of its panels, the four Build tabs, Warga, Staff, Neighbours and an RT's detail, Wacana and a policy's detail, 17 Agustus, every card a stage change brings, one event card).
- **When:** on the RT 3★, RW and Kelurahan dev saves, and the Kecamatan, reached by promoting the Kelurahan save.
- **How:** at 320, 360, 412 and 430 px, in Indonesian and English, in the light and dark themes: 64 runs.
- **What it checks:** the e2e suite's own scans, legibility (rules 1, 4, 5), density and primary buttons (13, 14), label words (16) and vertical centring (18).
- **Output:** `audit/report.md`, and a screenshot of every screen in `audit/out/` (not committed) for the rules checked by eye.

The density allowlist moved from `tests/e2e/ui.spec.ts` to `tests/e2e/density.ts`, so the e2e test and the audit read the same caps. The report keeps allowlisted screens apart.

## First run: 1224 screens, 13 distinct fails, all density
No legibility, label-word or centring fail on any screen, width, language or theme. The density fails were on screens the e2e test does not reach:
- **17 Agustus panel** (it opens only once the panitia forms): up to 98 words in view, a 24-word paragraph, and a filled `btn-primary` on every contest, so up to 3 primaries.
- **Wacana at the Kecamatan:** up to 70 words in view. The Razia card and its flavour line sit above the list.
- **Neighbours at the Kecamatan:** 53 words in view at 430 px in English.
- **Event cards:** the Hibah Tunai body was 21 words in English.

## Fixes
- **17 Agustus panel:**
  - The pick button toggles a contest on and off, so it is now a Choice (`btn-choice` with `aria-pressed`), never the primary (rule 14).
  - The contest's flavour line left the list. Panjat Pinang and Balap Karung now show it on their day screens, and the others already showed it there.
  - "times turnout" left each prize line, because the stage help already says every prize grows with the crowd. The intro, the ketua help and the stage help are shorter in English, and "Everything can still change" is gone.
- **Wacana:**
  - The Razia card's flavour line is gone, since the razia result card carries the same joke.
  - The intro is shorter in both languages.
  - The English status reads "Unannounced" (was "Not announced").
- **Neighbours:** the other Kelurahan's line reads "Next ★ in about N weeks".
- **Event text:** a new unit test, `tests/event-words.test.ts`, checks every event body (20 words or fewer) and choice (6 or fewer) in both languages. Stat names and money count as icons, as on screen. It found four English lines over, now cut: the hibah and protest bodies, Hibah Tunai and one Utang Viral choice. This closes the TODO item "English event bodies over 20 words".
- **Dark theme (by eye, rules 4 and 6):** the staff stat icons and meter icons are drawn in dark ink and nearly vanished on the dark theme. The honesty scales on a "who do you send?" button showed only their two gold pans. They now get a thin light outline on the dark theme only.

## Second run: 1239 screens, every screen passes
Only the allowlisted screens remain: Settings (2 primaries, up to 65 words in view) and Warga (376 words when scrolled at the Kelurahan), within their caps.

## Rules checked by eye (2, 3, 6, 9, 11)
I read the screenshots of the map, Build, the goal list, an event, Staff and Wacana at 320 and 412 px in both themes, at each stage. The main screen keeps its two top rows, map, goal pill and dock (2). Primary actions sit low (3). Icons always have a number or label (6), and the dark-theme stat icons are now fixed. Disabled buttons say what is missing (9). Rule 11 needs motion and was not judged from stills.

## Verdict
Self-approved under the TODO rule. Every screen passes UI.md's measurable rules at every width, language and theme, apart from the two allowlisted screens. TESTING.md: the audit is in the repo and repeatable, and the event-words test runs on every PR.
