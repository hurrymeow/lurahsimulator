# T1: bots hire an Asisten and answer raises

Implemented exactly as planned: `Plan.hire`/`Plan.realisasi`, `staffWhen` (answer raises, hire the highest-Lobi applicant, post a Grup WA Asisten lowongan every fourth tick when the kas allows), `realisasiWhen`, the plan flags (`cheapskate` no hire, `honest` realisasi), and the new harness test.

Stopped: the prescribed affordability trigger bankrupts `builder` on seed 3, so the required test cannot pass. At RT 1★ the bot has 3 staff slots and posts as soon as `rupiah >= lowonganCost('grupWa') + 200k` (Grup WA is free). It hires Bu Tari (3★, Rp 450k/week) at t=14 and Bu Dian (2★, Rp 300k/week) at t=18. With Inem the wage bill is Rp 825k/week against roughly Rp 500k/week of early income; rupiah is about −2.2M by t=24 and never recovers, so the bot stops building and never posts again. Both hires later lapse or are poached by t=88. At t=400 and at the 800 cap the final state holds only Inem (one Asisten). Typecheck passes and the rest of the suite passes (660 passed, 9 skipped); only the new test fails.

Question for the coordinator: how should the trigger and the test be reconciled? Options:

1. Make the posting trigger wage-aware (for example require the kas to cover the wages, or a month of them, on top of the buffer) and keep the rest of T1 exact.
2. Change the new test to assert the bot hires at least one Asisten at some point instead of two in the final state at 400 ticks (for example stop at ~30 ticks or record hires).
3. Raise the builder's buffer so the first hire waits until the economy can carry the wage, then retest 400 ticks.
4. Restrict hiring to a later stage (RW onward) where income covers the wages.
