# WebKit: the yearly report card test

Reproduced locally in WebKit (`E2E_BROWSER=webkit`). The report card is not a game bug. The test's loop ran two ticks and cleared modals with an immediate `isVisible()` check. WebKit shows the tip or event card a frame later than Chromium, so a card was still open on the next tick and the clock never reached the quarter end (month stuck at 11).

Fix: the loop now ticks only when no modal is open, waits 150 ms, clears whatever opened (an event takes its free first choice, a tip is tapped away), and stops when the report shows. It passes in Chromium and WebKit at 412 id. No game code changed.

Verdict: self-approved under the TODO rule (TESTING.md: WebKit parity).
