# Stat icons, PR 2 and PR 3

Follows `decisions/stat-icons.md`. Every ID and EN string that the renderer turns into an icon was listed and read, on the screens PR 1 left: buildings, inspector, events, jobs, staff, mangkrak, calo, Wacana, Realisasi, stage goals, Kelurahan and RW goals, the stats explainer, How to play and the report card.

- "Lubang Viral" keeps "Viral" as a word (`{plain:Viral}`): there it is an adjective, not the stat. "Viral Pothole" was already a word in English.
- The Urusan Surat story keeps "Orang Dalam" / "Orang Inside" as a word: there it is a person, not the resource.
- English text never uses the Indonesian stat words. Eight strings said "Orang Dalam", and the Lomba prize lines and the Diskominfo inspection said "Viral", so those words never became icons in English. They now say "Orang Inside" and "Virality". A unit test guards it.
- ID "Pakai Orang Dalam · {n}" sat beside a key icon, so it showed two keys. It now reads "Minta tolong · {n}", matching EN "Call a favour".
- "Makin Viral" read "makin [flame]". It now reads "Makin tinggi Viral".
- The legend: the stat explainer card's title keeps the word (`{plain:...}`) beside its big icon. That is the one place a stat is named in words; everywhere else it is the icon.
- Stage goals, How to play and the report card read well with icons and need no change.
