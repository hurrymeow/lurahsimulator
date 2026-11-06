# WebKit: the Balap Karung test

TODO item "WebKit: Balap Karung's tap button detaches on every tap".

## Cause
The button is not re-created on a tap. `mash()` in `src/ui/lomba.ts` builds it once and only updates the bar and the count. The race ends on a 5-second timer and the result page then replaces it, so the button leaves the DOM. The test clicked a fixed 40 times. In Chromium 40 clicks take under 5 seconds; in CI's software-rendered WebKit they take longer, so the clicks after the timer wait for a button that is gone, and the test times out. The same failure shows in Chromium with a 150 ms delay on each click.

## Fix
The test taps until the result shows, up to 40 times. A click that fails because the race ended at that moment is accepted; any other click failure still fails the test. No game change: ending the race on the timer is the design.

## Verdict
Self-approved under the TODO rule. TESTING.md: the test still checks every mini-game through to the prizes. Passes in `phone-320-id` and `phone-430-id`, and in `phone-320-id` with a 150 ms delay per click, which failed before. WebKit is not installed in this sandbox, so the next WebKit nightly is the proof.
