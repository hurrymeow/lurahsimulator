# The goal strip shows what is left for the next star

Hari did not like the one "Kini: ..." action in the goal pill (for example "Kini: capai 60 warga.") and wanted to see what is left for the next star.

- The pill's one line now reads "★ berikutnya, 3 target lagi: 60 warga (punya 42)" (EN "Next ★, 3 goals left: ..."), or "target terakhir" / "last goal" for the last one. It shows the first unmet goal from `nextStarChecklist`, with have and need.
- Tapped open, it lists every unmet goal, one row each, then one "Langkah berikut" / "Next step" line when there is a step that helps.
- A step is one of: the first Rumah, the first combo (at month 30, or as soon as it is all the star still needs), waiting on a build, beds, or what draws people when residents stop coming. "Capai N warga" is gone: the star list already says it with have and need.
- The first Rumah and the first combo still lead the line instead of the star goals, because they teach. That keeps the combo-priority rule from `decisions/ui-batch-oct29.md`. With no star left (stage maxed), the step leads.
- The "Kini:" / "Now:" prefix is dropped from every step. `nextStep` returns the step's kind as well as its text, so the strip can choose; `shortGoal` stays as its text.
- UI.md rule 5 still holds: one clamped line inside the button that opens the whole text.
- Built without a layout draft from Hari, at the owner's request. Hari reviews it in the PR.
