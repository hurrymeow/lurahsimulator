# Neighbour RTs: bigger Dana with a boost, auto-dana, missing goals, shared combos

Julian and Hari, 2026-10-29. Covers the high-priority TODO items "Give the player levers to speed up neighbour RT stars" and "Make combos count globally", plus "Auto-fund the neighbouring RTs".

## What a bot run showed first
- Funded every month for 20 years, every Rajin RT stayed at 1★: its build list makes only one combo (Rivalitas), and 2★ needs 2. The other traits took about 9 years to reach 3★.

## Picks
- **Dana banks up to 12 builds** (was 3), bought x1 or x6. Funding again and again was a chore (Julian).
- **Boost:** banked Dana speeds up building, with diminishing returns: `1 − 0.8^(banked − 1)`, capped at +100%. The RT's progress toward its next build grows `(1 + boost) / buildEvery` a month. The screen shows "+N% boost" (Julian). Each build still costs one Dana: the boost buys speed by paying up front, not extra builds.
- **Auto-dana** per RT: Off, or keep 3, 6 or 12 banked. Fixed floor of Rp 5jt (price-adjusted) instead of a player-set floor: one less setting, and it keeps the kas out of the bailout zone. The monthly cost estimate is shown.
- **Missing goals:** each RT row shows its next-star checklist (`starChecklist` on the RT's view, the same text as the player's).
- **Shared combos** (Hari's rule): an AI RT's combos goal uses the most combos found by any RT, the player's included. It lives in the view (`comboShare`), so the player's own RT check and every RT's ranking score are unchanged. Since the player needs 3 combos to finish RT anyway, AI RTs in practice no longer gate on combos. That is accepted: their stars now hinge on residents, which the player speeds up with Dana.
- Not done: (c) send a Posyandu (it already adds Sabar to every RT) and (d) a Bantu action. Revisit after playtest.

## Pace after (bot, Sabar not limiting, auto-dana)
- Keep 3: Hobi 3★ at about month 83, Jarang 57, Rajin 55.
- Keep 6: Hobi 68, Jarang 46, Rajin 39.
- Keep 12: Hobi 59, Jarang 40, Rajin 39 (Rajin is capped at one build a month).
- Residents are now the limit: an RT gets a house only every other build.
