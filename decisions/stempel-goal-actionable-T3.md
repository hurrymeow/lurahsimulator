# Stempel goal: "on track" while holding

The RW Stempel star goal stays open for many months, so an unmet line looked like a failure even while the backlog was under its limit. `ChecklistLine` now carries `holding`, true only for an unmet `stempelClear` line whose current backlog is under `goal.under`. The opened goal row appends `goal.onTrack` ("on track, keep it up" / "aman, pertahankan") when the line is holding. The closed goal pill, other goal kinds and all goal mechanics are unchanged.
