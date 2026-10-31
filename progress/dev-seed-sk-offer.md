# Dev seeds now offer the SK

Seeds rt3 and rw sat at 3 stars but never had the SK marked offered, because stars were set directly and the monthly star system skips stages already at 3. So the promotion never appeared. The seed files now carry `sk: offered`, the seed bot sets it on regenerate, and `loadSeed` offers it defensively. Tests accept the SK for rt3 and rw and check kel has a next-star checklist.
