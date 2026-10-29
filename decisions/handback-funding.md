# A handed-back RT resumes its Auto-dana

Hari's high-priority bug, 2026-10-29: after a takeover and hand-back, the RT never builds again.

- **Cause, found with a test:** `takeover` refunds the banked Dana and turns Auto-dana off. `handBack` restored neither, so the RT came back with no Dana and auto-dana off. It sat "Stalled", which looked like a broken RT. Once funded, it builds normally (test).
- **Fix:** the Auto-dana level is remembered at takeover (`autoBefore`) and turned back on at hand-back, so the RT resumes at the next month with no tap. The banked Dana itself is not restored, because the takeover refunded it to the kas.
- **Saying so:** the hand-back toast says either "Auto-dana is on again (keep N)" or "it builds only with Dana banked: fund it, or turn on Auto-dana".
- **The other silent stall:** a lot with no free tile cannot build, even with Dana. This can happen after the player fills a lot and hands it back. The RT's status line now says "The lot is full" (`lotFull`).
