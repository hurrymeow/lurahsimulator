# Kelurahan frame-rate floor 0.5 to 0.4

Hari, 2026-10-28. The dense Kelurahan fps test failed by under 1% on shared runners, on main and on every open PR, after #110 made HUD icons heavier. The floor drops from half of the RT frame rate to 40%. Real cost cut is #114 (icon cache). The effects floor (0.35) is unchanged.
