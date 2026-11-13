# Scorecard leftovers T3: builder bots visit neighbours

Shipped task T3 of `docs/plans/scorecard-leftovers.md`: `visitNext` in `tests/scorecard/driver.ts` spends spare Orang Dalam on Kunjungan, enabled for the builder and shopkeeper plans only. Item 13 now drops the B4 Orang Dalam phrase from its generated evidence and keeps B1, where no neighbours exist yet, so `scorecard.ts` is unchanged. Typecheck, the full unit suite and the scorecard harness test are green; the real work log is `progress/scorecard-visit-odn-T3.md`.
