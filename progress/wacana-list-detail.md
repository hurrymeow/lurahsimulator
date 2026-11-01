# Wacana list and detail (T2 of docs/plans/ui-hierarchy.md)

- The Wacana sheet is a list: one row per policy with name, approval meter, a running Realisasi state and a chevron.
- A row opens a detail in the same sheet, with a back button. It shows the joke line, then Umumkan (secondary) beside Kerjakan (primary). Columns stack at 320px.
- The detail stays open after Umumkan and after Kerjakan.
- Words in view: 30 to 41 on the list, 33 to 36 on the detail (limit 50).
- Dropped: the Realisasi flavour line and the "(Realisasi: name)" heading. The Realisasi name is now the column heading.
- The detail reuses the sheet, not the tap-to-dismiss pop-up, because the pop-up cannot hold buttons that stay open.
