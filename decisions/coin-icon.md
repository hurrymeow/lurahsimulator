# Money is the coin everywhere

- Hari (2026-10-29): panels and buttons printed "Rp 1.344.000" while the money row shows the coin. One game, one money look.
- The stat-icon renderer (`src/ui/statIcons.ts`) now also turns a money amount in running text into the coin and the signed amount: "Rp 8.064.000" → [coin] 8.064.000, "-Rp 50rb" → [coin] -50rb, "Rp 50 juta" → [coin] 50 juta. This replaces the line in `decisions/stat-icons.md` that kept "Rp 40rb" as text.
- Why the renderer and not a helper per screen: `rupiah()` is called from about 20 screens and about 40 strings carry `Rp {amt}` or a literal amount. The observer already decorates every popup, toast, sheet and button, so one rule covers all of them, event and notice text included, and new screens get it for free. `rupiah()` still returns the plain string, which stays the accessible text where the renderer does not run.
- Icon and amount sit in one nowrap pair, so they never split. The icon's `aria-label` is "Rupiah", so a button reads "Dana ×6, Rupiah, 8.064.000".
- Kept as text on purpose:
  - "Costs Rp," with no amount (Aspal Ulang blurb): a word, not an amount.
  - `aria-label`, `title` and input values: attributes are not decorated, and stay spelled out for screen readers.
  - The map canvas: number pops already draw the coin and a short amount.
  - `{plain:...}` escapes, for any future line that must keep "Rp".
- The Neighbours row read "1 stars". It now uses the ★ form the rest of the UI uses, with counts after their labels so no plural is needed: "RT 2 · 1★ · warga 4 · bangunan 6".

## Audit

| Screen | Money before | Now |
| --- | --- | --- |
| Neighbours: Dana buttons, auto-dana line | Rp text | coin |
| Staff: salary, raise, bimtek, pesangon, hire, post | Rp text | coin |
| Report card: income, vs last | Rp text | coin |
| Inspector: income, upkeep, upgrade, demolish refund | Rp text | coin |
| Wacana, mangkrak, repair | Rp text | coin |
| Build list need-more, build and move bar, path line | Rp text | coin |
| Stats totals | Rp text | coin |
| Event choices and results, notices with `Rp {amt}` | Rp text | coin |
| Building, combo, job and wacana blurbs with amounts | Rp text | coin |
| Map number pops (canvas) | coin already | unchanged |
| aria-labels | Rp text | unchanged, on purpose |

## Icons inside buttons

- An icon's tap shows "[icon] = name" and stopped the click there. With prices now on buttons, a tap on the coin in "Dana ×6 [coin] 6.000.000" (or on the key in "Take over · 3 [key]") did nothing. Inside a button, link or label the icon now leaves the tap to the control; the name toast is for icons in plain text.
