# T10: item 16 spend proxy

Replaced the Unknown row 16 in `tests/scorecard/scorecard.ts` with a spend-share verdict built from builder `built` events: cost summed per building kind per band, with Rumah, Warung and Jalan Setapak exempt. Added `topSpendByBand` and `dominantSpendKinds` plus a harness test in `harness.test.ts`, and a skipped-unless-MEASURE `measure-T10.test.ts` that prints the per-band top kinds for a local run.
