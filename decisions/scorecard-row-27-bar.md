# Row 27 bar: goal on screen, progress one tap away (2026-11-13)

GAME-DESIGN.md §8 item 27 now passes on "current goal on screen within 5s, in both languages". Its progress (have
and need) is one tap away, not on screen, because `decisions/goal-line-one-goal.md` keeps the closed goal pill to one
line. The Bad line now also fails a resume where the goal's name is cut off. The scorecard drops its
`progress-on-screen` override, so row 27 reads the T2 spec's verdict directly (Pass when the goal line is on screen
after a reload, in both languages).

Why: the pill was deliberately fixed to show one goal name without a cut-off, and a returning player needs the goal,
not its numbers, in the first five seconds. The tap is one.

Counter: Kairosoft shows progress without a tap. Kept anyway: the goal's name comes first, and the tap is one. The
T2 spec still records `progress-on-screen` (a test annotation, not an assertion) so a later pill change can be
measured.
