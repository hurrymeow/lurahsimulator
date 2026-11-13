# Scorecard leftovers T3: builder bots visit neighbours

Task T3 of `docs/plans/scorecard-leftovers.md`: the builder and shopkeeper plans now spend spare Orang Dalam on Kunjungan at an AI-run RT, behind a `visit` flag in `tests/scorecard/driver.ts` so no other bot's plan changes. Item 13's evidence is computed from the timeline, so with visits the B4 Orang Dalam phrase drops by itself while B1 stays (no neighbours exist before the RW promotion at about 13 min); `tests/scorecard/scorecard.ts` needed no change. See the fuller note in `decisions/scorecard-visit-odn-T3.md`.
