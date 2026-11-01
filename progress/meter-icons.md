# Perut, Kerja and Aman icons (T4 of docs/plans/ui-hierarchy.md)

- Three 16px pixel icons in `src/render/stat-art.ts`: a rice bowl (Perut), a briefcase (Kerja) and a shield (Aman). The artist's sprites are untouched.
- `src/ui/statIcons.ts` turns these words into icons only when a number follows, for example "Kerja +5", "Aman −3", "Perut 60". Other uses stay words, because Aman means "safe" and Kerja Bakti is a policy name.
- A minus sign (U+2212) now stays with its number in an icon pair.
- New strings `res.perut`, `res.kerja`, `res.aman` name the icon on tap.
- Not changed: "Aman across the Kecamatan of at least {n}" and the Sejahtera explainer, where the word does not sit next to its number.
