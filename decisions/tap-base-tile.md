# Map taps hit the base tile

Hari, 2026-10-28. A tap on the map now picks the ground tile under the finger, then the building whose footprint holds it. Sprite pixels no longer count.

Why: a tall building's sprite covered the one behind it, so the hidden one could not be selected.
