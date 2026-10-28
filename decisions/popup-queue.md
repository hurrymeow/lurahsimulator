# Popup queue waits for a quiet moment

## Problem
Playtest, 2026-10-28: a popup appeared while the player was tapping speed or Build, and that tap dismissed the popup instead of doing what the player meant. Report and ranking cards also landed back to back, so the second card stole the tap after the first was dismissed.

## Cause
`modal()` showed a card at once when the queue was empty, and the frame loop showed a queued card on the next frame after a sheet closed. Neither checked whether the player was mid-tap, placing, or had just dismissed a card.

## Fix
- `modal()` only queues. The frame loop is the only place a queued popup or event card appears.
- New pure rule `src/ui/popupQueue.ts`: a queued card shows only when no card is showing, no sheet is open, the player is not placing, home and how-to are closed, and 500ms have passed since the last pointer or key input.
- Dismissing a card hides it at once, so the dismiss tap still gets instant feedback. The next queued card waits for the quiet moment, at least 500ms after that tap.
- User-initiated cards are unchanged: a resource explainer and an event outcome still show at once, because they are the direct answer to the tap that just happened.

## Not in scope
Roads, population demand, the update banner, and the 2045 meter are separate playtest items. This change touches none of them.
