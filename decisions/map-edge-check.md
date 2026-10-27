# Map edge sanity check

E2E reads the map canvas and fails if a whole edge line (left, right, top or bottom) is black or empty. It runs on home, in game, and in game with a seeded kampung, at every viewport in both languages.

Why: a stale canvas size or camera shows up as a dead strip at an edge. The box-size checks do not see a canvas that is the right size but drawn wrong.
