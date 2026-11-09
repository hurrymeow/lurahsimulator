# Refused requests, and Baperan who leave less often

Owner request (2026-11-09): a bug where a refused personal request reads as a refused raise, and Baperan staff who always walk out.

## The bug
Saying no to any Urusan Pribadi request (cuti, a loan, a course, a resource), or letting it lapse, set the same `refused` flag as a refused raise. The staff card then read "Kenaikan ditolak. Kampung Sebelah menelepon." ("Raise refused") with a "Kenaikan ditolak" chip, though no raise was asked for. A poach after it said "Kenaikan yang kamu tolak, mereka bayar."

Fix: `refused` stays (any refusal still makes a poach possible, as GAME-DESIGN.md says), and `refusedWhat` records whether it was a raise or a request. A refused request reads "Permintaan ditolak. {rival} menelepon." ("Request refused. {rival} is calling."), its chip "Permintaan ditolak", and its poach notice "Kamu bilang tidak. Mereka bilang iya." Saves without the field read as a raise, which is what they meant before requests existed.

## Baperan
A Baperan left at once on every refusal, raise or request. Now each refusal adds 25% to the chance (`BAPERAN_LEAVE_STEP`, counted in `refusals`): 25% the first time, then 50%, 75% and always from the fourth. Raises and requests count together, and an accepted raise does not reset the count: the trait remembers being told no. A Baperan who stays is flagged as refused like anyone else, so the 10% monthly poach applies too.

A Baperan who leaves on a refused raise now closes the detail view the way a refused request already did, instead of leaving it open on someone who has gone.

## Checks
- Unit: a refused request records `refusedWhat: 'request'`; over 200 seeds a first refusal makes a Baperan leave in 30 to 70 cases; the fourth refusal always does (requests and raises).
- e2e (320px id, 412px en): no to a loan request shows "Permintaan ditolak." / "Request refused." and never the raise line.
- No scorecard bot refuses a raise or a request, so bot numbers do not move.

Updates GAME-DESIGN.md (Managing, Urusan Pribadi). Verdict: owner request; self-checked against UI.md (labels under 6 words, the card line under 20) and TESTING.md.
