# Warung draw hint (T1)

`bestDraw` now skips building types the player already owns (`count(s, d.id) === 0`), so the "nobody new is coming, build a … to draw residents" hint never names a Warung Sembako that already stands. Its attract per rupiah made it always the top pick, which read as a request to build a second one; the next best draw is named instead, or the step is null when nothing is left.
