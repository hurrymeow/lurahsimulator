# T3: item 8 counts the Now strip's step as a short goal

Item 8 now logs a `step` event when `nextStep` changes kind or text, and the short horizon counts those events alongside a met checklist line in the same 2 min window. Why: the Now strip points at the next concrete action even when no checklist line is close to done, so a player always has a visible short goal. `GAME-DESIGN.md` §8 item 8 Good now names it, per the conformance protocol.

Reviewer: merged. Short rises from about 45% to about 72%, still under the 90% bar. Per decision 5 of the plan, the next plan adds checklist lines between stars; the gaps to fill are the stretches over 2 min with no line and no step change.
