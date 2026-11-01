# Stempel as a next step

At the RW, the first star can be waiting only on Stempel. `nextStep` now returns a `stempel` step once the backlog reaches `STEMPEL.clearUnder - 1`, and returns null below that so beds or draw hints do not distract from the goal the star is waiting on. The goal pill leads with this step, like the house, combo and desk steps. The strings are the plan's verbatim EN/ID lines; the English line is longer than UI.md rule 16's six-word pill cap, so it ships as specified and that cap should be revisited if the pill clips.
