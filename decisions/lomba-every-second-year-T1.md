# Lomba every second year

The Lomba Agustusan now runs every second game year (`LOMBA.everyYears = 2`) instead of every year, answering issue #360: it is held in `yearsDone` 0, 2, 4, and so on. The announce gate in `lombaSystem` gained `year(s) % LOMBA.everyYears === 0`. In a skipped year no panitia card forms, so `s.lomba` stays last year's, `lombaPrep` returns null (its year differs) and the day step returns early before any Popularitas loss. The scorecard's calendar-rhythm item and the new lomba test use the same constant.
