# Tutorial tips on actions, combo taught by doing one

- `src/ui/howto.ts`: action and state triggers for house, combo, jobs, wacana and ranking; `Step.tip` for a tip body and pictures built from the kampung; `Step.tipOnly`; the new `comboFound` tip (`how.13`).
- `src/ui/tips.ts`: uses `Step.tip` when it returns a card.
- `src/sim/nextstep.ts`: `easiestCombo` is exported and returns the building ids.
- i18n: `how.4.tip`, `how.4.tipNext`, `how.13.*`; `how.6.body` and `how.10.body` say the gain.
- Tests: `tests/tip-triggers.test.ts`; e2e "combo tutorial"; the tips and jobs-tip e2e use the new triggers.
