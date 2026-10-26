# Balance autoplayer tests get a 30s timeout

The content wave (#55) added 26 combos and many placeable buildings, so the autoplayer tests take about 2.5s locally and over 5s on CI runners, past vitest's 5s default. They now pass an explicit 30s timeout. The assertions are unchanged.
