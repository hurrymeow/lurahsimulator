# Scorecard bot fixes T2: measurements

`buildCombo` now counts the upgrade a level-needing combo requires (see `decisions/scorecard-bot-fixes-T2.md`). Typecheck and the full `npm test` (699 passed, 10 skipped) pass. The Done-when measurements do not: `takeover(3, 'random', 100)` returns `gained: false` both before and after the change (takeover seeds 1 to 5, random at 100 ticks: true / true / false / true / false), and the builder at 700 ticks is more than 1 min later than after T1 on some stars:
- Builder after T2: seed 1 `0.3/8.5/9.9/10.9/22.4/28.8`, seed 2 `0.3/7.6/10.8/11.7/20.1/25.6`, seed 3 `0.3/8.5/10.1/11.1/20.9/27.2`.
- Builder after T1: seed 1 `0.3/8.4/10.0/10.9/21.2/27.2`, seed 2 `0.3/7.7/9.2/10.0/21.7/25.6`, seed 3 `0.3/8.9/10.4/11.2/24.0/27.2`.
- Later by more than 1 min: seed 1 5★ +1.2 and 6★ +1.6; seed 2 3★ +1.6 and 4★ +1.7. All other stars are earlier or within 0.4 min.
The takeover seed 3 state is still RT with 0 stars, 59 buildings and Rp 8.7jt after the random bot; the combo upgrade cost cannot affect it, since the builder does not reach a level-needing combo in the 150-tick window.
