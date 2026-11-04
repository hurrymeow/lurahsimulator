# UI text cuts: Staff, Stats, opener, How to Play, toasts, Combo clamp, goal list

Plan: `docs/plans/ui-audit-fixes.md` T7, T8, T9 (Combo part), T12, T13 and T14, plus decision 6 (the goal list). Batched into one PR because each task deletes a `DENSITY_ALLOW` line and would conflict with the others. T6 (Build cards) stays with executor PR #255.

- **Staff (T7).** One line per person: name, level, role and stars. A chip flags a raise ask, time away or a refused raise. Bimtek, the raise answer, Mutasi and Let go live only in the person view. The intro line and the per-role blurb on open roles are gone; the post view still shows the blurb.
- **Stats (T12).** Numbers first: totals, Emas %, score, the last 3 rankings. The plan said 4; English at 412px counted 53 words with 4, so 3 keeps both languages under 50. How Emas and the score move sits behind a "How it works" tap. Score text says every 12 weeks, matching the weekly calendar now on main.
- **Opener (T8).** Four strings cut to one short line each. The week line says "A week is 8 seconds" to match the weekly calendar.
- **How to Play (T13).** The Menu guide is an index: one heading per step, a tap opens its picture and text. The first-launch opener keeps the full text.
- **Toasts (T14).** `toastParts` shows the title, plus the body only when both fit in 8 words. The Log keeps the full notice. "Moved out" now names the reason in its title. Audit of the 49 notice title keys: all are 8 words or fewer in EN and ID.
- **Combo cards (T9).** The effect line no longer clamps. The legibility scan's `data-clamp` exception is removed, since the goal pill also no longer clamps; UI.md rule 5 now has no exceptions in code either.
- **Goal list.** Bug confirmed: the opened goal list stayed open under any sheet. `openSheet` now fires a `sheet-opened` event and the goal list closes on it.

## Verdict (self-approved under the TODO approval rule)

- UI.md rule 13: Staff, Stats and How to Play pass with their `DENSITY_ALLOW` entries deleted, at 320, 360 and 430px in ID and 320 and 412px in EN.
- Rule 5: Combo tiles pass the scan with no clamp at 320px ID.
- Rule 7: opener steps are 15 words or fewer.
- Rule 14: Staff rows have no primary button; the person view keeps one.
- Known, not from this PR: in English at 412px, Build tab 2 (102 words) and Warga (496 words) run 1 and 2 over their allowlist caps on main too. English is not in CI. Logged for the T6 Build card work.
