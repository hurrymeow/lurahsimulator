# Orang Inside fades 5% a week

TODO item "Fix the remaining scorecard Fails that have a clear cause", next plan step: row 13, "an Orang Dalam sink in the Kelurahan and Kecamatan".

## What was wrong
- **Row 13 failed on "Orang Dalam B4 never spent".** The row reads the stock's net change each week, so the Fail means income beat spending in every week of B4.
- **The pile was the real problem.** Bots ended Act 1 holding 770 to 880 Orang Inside (median over seeds 1 to 6). A probe on builder seed 1 found the income:
  - about 0.6 a week at the RT (Kantor RT and the Rapat Malam combo);
  - 1.4 in the RW (three Fotokopi);
  - 3.1 at the Kelurahan (six Panitia jobs on an upgraded Balai Warga).
  Every sink costs 1 or 2: a permit skip, a visit, an event choice, a Razia, a Decor. More sinks at the Kelurahan would not touch a pile of hundreds.

## What changed
- **Orang Inside loses 5% a week** (`ORANG_DALAM_FADE` in `src/sim/balance.ts`, applied in `decay()` beside Viral's 10%). Favours are forgotten, which is the joke: the favour you were owed last year is worth nothing now. The stock settles near 20 times its weekly income, so spending favours never stops mattering.
- The resource card's "down" line says so in both languages: "Favours are forgotten: it fades 5% a week." / "Utang budi cepat dilupakan: turun 5% tiap minggu."
- GAME-DESIGN.md gets one rule line, beside the Viral soft cap.

No new sink, screen or button. The fade fits the existing rule for Viral.

## Evidence
Nine player types, seeds 1 to 6, main (c954245) against this branch: `BOT=<type> SEEDS=1,2,3,4,5,6 SCORECARD=1 npx vitest run tests/scorecard/run-one`.
- **Star times:** identical for all nine types, every star, every seed. No bot ever lacked Orang Inside for what it wanted.
- **Orang Inside held** (median over seeds):

| Bot | end, main | end, here | RT median, main | RT median, here | Kelurahan median, main | Kelurahan median, here |
| --- | --- | --- | --- | --- | --- | --- |
| builder | 768 | 62 | 28.6 | 12.6 | 502 | 58 |
| shopkeeper | 881 | 70 | 18.9 | 10.9 | 574 | 67 |
| Pencitraan | 855 | 72 | 34.5 | 13.7 | 516 | 70 |
| honest | 816 | 72 | 30.7 | 12.8 | 484 | 66 |

- **Local scorecard report** (same caches plus the takeover run): row 13 Fail to **Pass**; 10 Pass, 12 Fail, 5 Unknown, against 9, 13 and 5 on main. No other row changed verdict.
- `npm run typecheck`, `npm test` (707), and the resource-chip e2e at 320 id and 412 en pass.

## Seen, not changed
- Row 13 passes partly because the fade itself is a weekly fall. The bots still spend favours only now and then (visits, permit skips). With the stock at 10 to 70, an Orang Inside cost of 2 to 5 would now be a real choice. That makes room for a Kelurahan sink worth more than 1, if one is wanted later.
- Panitia income still scales with Balai Warga levels (6 jobs at level 3). It is bounded now, so it is left as it is.

## Verdict
Self-approved under the TODO rule. GAME-DESIGN.md §8 row 13 passes for a stated cause, with no change to pace or the type spread. GAME-DESIGN.md is updated in this PR.
