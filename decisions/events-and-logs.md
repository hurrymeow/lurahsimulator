# Events that matter, and a fuller log (playtest feedback)

- Random popups share one pool. One popup at most every 5 months (`POPUP_GAP`), 40% chance when the gap is open, picked by weight. Scheduled events (17 Agustus, Kecamatan) ignore the gap. Adding events adds variety, not interruptions.
- Minor happenings are log lines, not popups: 39 lines in `data/lines.ts`, one most months, never the same one within 12. Each moves a small number (a few Sabar or Viral, a few percent of income). Lines that need a building only show once it stands.
- Advice events (11) ask yes or no and roll a hidden outcome from weighted `outcomes`, revealed in the result popup. "No" is the free first choice and costs 1-3 Sabar, so declining is never free of consequence.
- Money in events scales with income. `cost.incomeMonths` prices a choice as months of net income (the dearer of that and the base), and `incomePct` pays or fines a share of one month. This stops the "income is high, always pay" problem after year 3. Sibling thread "Fix population pacing" owns the wider balance.
- Event text avoids naming resources, so the Patience to Popularitas rename does not touch it.
