# Indonesian UI text and the forced update (Hari, Oct 30)

Picks from the proposals doc (Decisions, Oct 30).

## Indonesian UI text, rows 1 to 15

- 1 `build.emptyTileBody`: Bangun is in the bottom dock, not Menu. Fixed in English too.
- 2 The greeting used "Pak Pejabat" for every player. `how.intro` and `page.welcome` now use the player's own title and name (`{pt} {pn}`), in both languages. `page.welcome` is only the ticker's empty placeholder.
- 3 Register: system text uses kamu; Inem keeps Anda, Bapak and Ibu in her own lines (`coach.*`). Changed: `exp.orangDalam.edge`, `name.kampung`, `name.name`, `dev.help`, `set.satire`, `staff.intro`, `staff.poachedBody`, and four staff and gig blurbs.
- 4 to 15 as in the doc: Orang Dalam in `insp.restartODn`, "★ berikutnya", "Permainan baru", "Aktif", "Level", "+{n}% lebih cepat", "Waktu kini berjalan…" (both coach.done lines), "Rupiah tidak cukup…", the shorter `insp.noRoad`, "Warga" for `res.pop`, "perawatan", "Bangunan baru terbuka".
- Row 16 stays "Combo".

## Forced update: option A

- A waiting version shows a full-screen card on the home screen only: title, one line, one button "Perbarui sekarang". The game is saved before the reload.
- During play nothing interrupts: the banner is gone; the Menu button carries a small dot (named "Versi baru siap" for screen readers) and Menu's Permainan group lists a Perbarui tile.
- `?debug` exposes `pakrtUpdate()` so e2e can show the update UI without a real new version.

## Tutorial Skip

- Kept. UI.md rule 10 stands.
