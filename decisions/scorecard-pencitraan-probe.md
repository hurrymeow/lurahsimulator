# Why the Pencitraan bot stalls at RT 1★ on some seeds

Probe for the TODO item "Scorecard bots: the last RT stalls" (scorecard item 17: Pencitraan never reaches RT 2★). No code change.

Seeds 1 and 2, `pencitraan` bot (builds without needs buildings, announces a wacana every 4 weeks). Popularitas gains and losses were summed by caller with a local, uncommitted hook in `gain()`.

| Over 120 weeks | Seed 1 (stalls) | Seed 2 (reaches the Kecamatan) |
| --- | --- | --- |
| Residents at the end | 34 | 89 |
| Popularitas from income | +444 | +1064 |
| Expectations | −372 | −565 |
| Ojol jobs | −281 | −257 |
| Combo penalties (price wars) | −246 | −172 |
| Wacana | +74 | +77 |
| Popularitas at the end | 9 | 87 |

- The split comes at weeks 40 to 60: seed 1 stays at 24 to 26 residents while seed 2 grows to 54, so income-driven Popularitas cannot cover expectations, Ojol and price wars, and Popularitas falls to 2 by week 90. RT 2★ needs Popularitas 50.
- Empty tiles are plentiful (126 at week 90), so it is not a placement bug.
- Both seeds pile up cash (Rp 110 to 264 juta by week 90, about Rp 7 juta a week from buildings): that is scorecard items 14 and 15 (cash health, cost curve), not this item.

Verdict: a strategy collapse, not a bot bug. Pencitraan skips needs buildings on purpose, and when early growth is slow nothing it does can lift Popularitas. Whether that is fair (the design wants Pencitraan 10 to 30% faster, not stuck) is a balance call for the scorecard Fails item: for example, a wacana that lifts Popularitas more when it is low, or Pencitraan's bot spending idle cash on a needs building when Popularitas falls under 30.
