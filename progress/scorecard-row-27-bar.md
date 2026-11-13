# Row 27 bar (2026-11-13)

Reworded GAME-DESIGN.md §8 item 27 so a return passes on the goal line being on screen within 5s, with progress one tap away, and made the goal's name cut off a Bad case. Removed the scorecard's `progress-on-screen` override so row 27 reads the T2 report verdict directly, and updated the harness test so a passing spec still passes when progress is hidden. The spec's parse assertion on the annotation stays.
