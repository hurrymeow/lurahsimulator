# Stempel goal: "on track" while holding

Added `holding` to `ChecklistLine` in `src/sim/stages.ts`, computed for unmet `stempelClear` lines from `s.stempel.backlog < goal.under`. The opened goal row in `src/ui/goal.ts` now appends the new `goal.onTrack` string (EN and ID) when holding. Added a test in `tests/higher.test.ts` for the RW stage with `fundedRts` done: holding at backlog 0, not at backlog 5.
