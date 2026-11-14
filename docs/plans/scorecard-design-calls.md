# Scorecard design calls

Goal: give every open scorecard row a verdict path. Evidence: Nightly run 43507934436 (2026-11-13, `decisions/scorecard-nightly-after-bot-fix.md`), its `scorecard.md` artifact, and a local per-line trace of builder, safety and shopkeeper on seeds 1 to 3. Row 14 belongs to the "Fix scorecard TODO items" thread and is left out. Rows 5, 6, 19 and 20 were not asked for and are not covered here.

## Finding that drives most rows

Combo lines bind most stars. The trace shows the combo line is met last for RT 1★ (shopkeeper), RT 2★ and RT 3★ (all three bots), and RW 2★ (`rwCombos`). Every other line of RW 2★ was met by minute 22; the star came at about minute 30. So the late RT 2★ (item 23), the RW 1★ to 2★ gap (items 7, 10), and the spread between bots (item 17) share one cause: how fast a plan finds combos. The fix goes to the bots first, because the game already shows the formula. The Combo book lists every combo with its pieces, and the next-step strip names the easiest one from week 12 (`COMBO_HINT_MONTH`).

## Decisions

1. **Item 17 RT 1★ (18x) is a bot gap.** Shopkeeper meets the residents line at 0.4 min and waits on its first combo until 4.9 min. The game names that combo at 1.6 min. A player who reads the strip builds it then. Fix: every strategy bot builds the piece the strip names before its own build order (T1). The bar stays. Expected result: RT 1★ for all four bots under 2.5 min, so the gap drops under 2 min and the row passes on the gap rule. Counter: a real shopkeeper player might ignore the strip too. Kept anyway, because the bar judges plans, not attention, and item 1 already covers a player who has nothing to do.
2. **Items 7, 10, 17 (RT 2★, RW 3★, Kel 1★) and 23 wait for T1.** No bar or goal changes now. Re-measure after T1 and T2 merge. If builder RT 2★ is still over 5 min (section 3 target 4), or any strategy bot still takes over 14 min (2x the RW star gap) from RW 1★ to 2★, the next plan tunes the combo lines. The first lever is the number of combos, not the bar. Counter: the target could be loosened instead. Rejected, because Hari approved the section 3 targets and this is tuning inside them.
3. **Item 21: the book counts as a hint.** The book shows every formula, so 100% of combos are hinted today, and 0 are hidden. The `hint` bot reads only the strip, which is why it finds 30%. Fix the measure: the hint share is what a book-reading bot (builder) finds, over all combos any bot found (T3). No hidden combos are added now. Counter: section 8 asks for about 1 in 4 hidden. Deferred, because combos already bind most star gaps and hiding formulas would slow stars further. Revisit once items 7 and 23 pass.
4. **Item 21, random placer at 0 combos looks like a counting bug.** 7 of 10 random seeds reach RT 1★ by minute 12, and RT 1★ needs a combo, yet the median count in the first 15 min is 0. T3 checks the count first.
5. **Item 1 proxy is too narrow.** It counts a stall when the cheapest unowned kind is unaffordable. Section 8 asks whether any affordable action moves an unmet line. T4 widens the proxy to the actions a player has: a new kind, another Rumah when beds are short, a combo piece, an upgrade, a repair, a permit skip or a neighbour visit. The 60s bar stays.
6. **Item 13 B1 is a bot gap.** RT 1★ gives 1 Orang Dalam and opens Kosan, Barbershop and Sawah, which all wait on a permit. Skipping a permit costs 1 Orang Dalam. The builder never places a permit building in B1, so the sink never fires. T5 makes the builder use the 1★ unlock. Counter: if no real player spends it in B1, the bar is wrong. Kept, because item 12 asks that a star's reward be usable right away.
7. **Item 15 key item is the wrong item.** "Next key item" is the cheapest unowned non-decor kind, so the median is 12s. A key item is the thing worth saving for: the dearest non-decor kind the player can build now and does not own. T6 adds that as a new column used by item 15 only, and adds the missing income against cost growth ratio per stage (bar 0.7 to 1.5). Item 14 keeps its column, so the row 14 thread is not disturbed.
8. **Item 11 B0 bar is under one tick.** The sim moves in 8s ticks, so any 2-tick gap reads 16s and fails a 10s bar. The tutorial also holds time in B0. B0 Novelty max becomes 16s (T7). Content depth stays Fail: content ends at the Kecamatan (minute 21 at 2x against 420). That Fail is known and is fixed by Act 2 and 3 content, not here.
9. **Item 12 counts kinds the wrong way.** It counts "has unlocks" plus "has a reward", so a star that opens a shop, a decor and a farm reads as one kind. Count kinds by category: non-decor building, decor, resource reward, new system (T8). Kairosoft counts plants as their own kind, so decor counts. Stars still at one kind after T8 get a fix in the next plan.
10. **Item 8 uses hindsight ETAs.** Bots replay a known future, so the ETA of a goal is the time until the timeline records it. Short = a checklist line met within 2 min. Mid = a star, an SK or the Lomba within 15 min. Long = the Emas bar moves at least once between stop points (T9).
11. **Item 16 uses a spend proxy, not ablation.** Ablation needs many runs per action. Proxy: per band, the non-exempt building kind with the largest share of builder spend. Fail if the same kind tops more than 2 bands (T10). Counter: spend is not payoff. Accepted for now and labelled a proxy in the row.
12. **Item 18 compares rolled options by expected value.** Today rolled outcomes are skipped, so the row stays Unknown. Compare each option's mean outcome; an option is dominated if another option is at least as good on every resource on average and better on one (T11).
13. **Item 24's second half is T1, not T2.** "The old map keeps paying in" is measurable in the sim: income from buildings placed before a promotion, 5 min after it (T12).
14. **Item 25 stays Unknown** until Act 3 and the endings exist. No task.
15. **Items 10 and 23 soft-lock cases need a diagnosis.** Shopkeeper seed 10 never reaches RT 2★, and 2 of 15 takeovers do not progress. T13 finds the cause. A cause inside `src/` is reported, not fixed in that task.

No decision here changes the game's goals, so none goes to Hari.

Changes from `decisions/scorecard-calls.md` (2026-11-07): that note kept rows 8 and 16 Unknown until Act 2 settles, and read rows 1, 11, 12, 15 and 21 as real gaps. Rows 8 and 16 now get cheap proxies, because hindsight ETAs need no ETA engine. Rows 1, 12, 15 and 21 now look partly like measure artefacts, after the per-line trace and a read of the Combo book. Each fix re-measures before any content change.

## Tasks

Run one at a time on the executor, in this order. T1 to T6 all touch `tests/scorecard/driver.ts` or `scorecard.ts`, so a later task starts from main after the earlier one merges. After T1, T2 and T3 merge, run Nightly and re-judge items 7, 10, 17, 21 and 23.

### T1. Strategy bots build the combo the strip names (Sonnet, executor trial)
- Files: `tests/scorecard/driver.ts`, `decisions/scorecard-design-calls-T1.md`, `progress/scorecard-design-calls-T1.md`
- Exact changes:
  1. In `playPlan`, before `buildFrom`, for any plan with `combo: 'book'`: when `nextStep(s)?.kind === 'combo'`, take `easiestCombo(s)` and call `buildCombo(c, p.buffer, pick.ids)`, as the `hint` branch does. Leave the `hint`, `random`, `idle` and `cheapskate` plans as they are.
  2. Find why shopkeeper's first combo lands at 4.9 min although `buildCombo` runs from `COMBO_HINT_MONTH`. If `shopsFirst` spends the cash first, move the combo call ahead of the order for the tick the strip names a combo. Note the cause in the decisions file.
- Done when: `npm run typecheck` and `npx vitest run tests/scorecard/harness.test.ts` pass. A local `runBot('shopkeeper', seed, 200)` on seeds 1 to 3 gives RT 1★ under 2.5 min. Report builder, shopkeeper and safety RT 2★ times on those seeds before and after in the progress file.
- Don't touch: `src/`, TODO.md, `tests/e2e/`. No refactors. No e2e needed.

### T2. Safety bot reads the RW combo line (Sonnet, executor trial)
- Files: `tests/scorecard/driver.ts`, `decisions/scorecard-design-calls-T2.md`, `progress/scorecard-design-calls-T2.md`
- Exact changes:
  1. Check that the `rwCombos` branch in `playPlan` (`buildCombo(c, p.buffer, RW_PIECES)`) also runs for `safety`, and that its `caps` do not block a piece. If `count(s, 'balaiRW') === 0` blocks it, buy Balai RW first for every plan, not only `hint`.
- Done when: typecheck and `npx vitest run tests/scorecard/harness.test.ts` pass. A local safety run on seeds 1 to 3 to RW 2★ shows the RW 1★ to 2★ gap; write the before and after in the progress file.
- Don't touch: `src/`, other plans' orders, TODO.md. No refactors. No e2e needed.

### T3. Item 21 counts combos right and measures hints by the book (Sonnet, executor trial)
- Files: `tests/scorecard/scorecard.ts`, `tests/scorecard/harness.test.ts`, `GAME-DESIGN.md`, `decisions/scorecard-design-calls-T3.md`, `progress/scorecard-design-calls-T3.md`
- Exact changes:
  1. In item 21, check `min(e.t) < 15` and the `combo` events for the random bot. Random reaches RT 1★ (needs a combo) in 7 of 10 seeds by minute 12, so the median count cannot be 0. Fix the count.
  2. Hint share: use the builder runs' median `end.discovered.length` over `found.size`, and say "book reader" in the evidence text. Keep the `hint` bot's share in the text as "strip only".
  3. In `GAME-DESIGN.md` §8 item 21 Evidence, replace `A hint-reading bot for hinted ones.` with `A book-reading bot for hinted ones (the Combo book shows every formula; decisions/scorecard-design-calls.md).`
  4. Add a harness test for the fixed count.
- Done when: typecheck and `npx vitest run tests/scorecard/harness.test.ts` pass.
- Don't touch: `src/`, the combo data, TODO.md. No e2e needed.

### T4. Item 1 counts any goal-moving action (Sonnet, executor trial)
- Files: `tests/scorecard/driver.ts`, `tests/scorecard/scorecard.ts`, `tests/scorecard/harness.test.ts`, `decisions/scorecard-design-calls-T4.md`, `progress/scorecard-design-calls-T4.md`
- Exact changes:
  1. Add a row field `useful: boolean`: true when any of these is affordable now: a new non-decor kind; a Rumah when beds are under residents plus 5; the missing piece of `easiestCombo(s)`; an upgrade that `checkUpgrade` allows; a repair; a permit skip; a neighbour visit (`checkVisit`).
  2. Item 1 counts a stall run while `!r.useful && r.goalsDone < r.goalsTotal`. Keep the 60s bar. Update the evidence text to name the action set.
- Done when: typecheck and harness tests pass, with one test for a stall and one for no stall.
- Don't touch: `nextKey` (items 14 and 15 use it), `src/`, TODO.md. No e2e needed.

### T5. Builder uses the RT 1★ unlock and its Orang Dalam (Sonnet, executor trial)
- Files: `tests/scorecard/driver.ts`, `decisions/scorecard-design-calls-T5.md`, `progress/scorecard-design-calls-T5.md`
- Exact changes:
  1. Check why the builder's `odn` never falls in B1 (1 to 5 min). If it never places a permit building there, make `builderOrder` place one Kosan (or Barbershop) right after RT 1★ when affordable. `maintain` already skips the permit.
  2. If `odn` does fall but inside the same tick as the +1 reward, record that in the decisions file instead and leave the driver.
- Done when: typecheck and harness tests pass. A local builder run on seeds 1 to 3 shows `odn` falling at least once in B1.
- Don't touch: `src/`, other plans, TODO.md. No e2e needed.

### T6. Item 15 uses the thing worth saving for, and the growth ratio (Sonnet, executor trial)
- Files: `tests/scorecard/driver.ts`, `tests/scorecard/scorecard.ts`, `tests/scorecard/harness.test.ts`, `decisions/scorecard-design-calls-T6.md`, `progress/scorecard-design-calls-T6.md`
- Exact changes:
  1. Add a row field `dearKey`: the dearest non-decor, non-housing kind the player can build now and does not own (same filter as `nextKeyCost`, `Math.max`).
  2. Item 15 uses `dearKey` in place of `nextKey`. Keep the bars (median 30 to 120s, 95th percentile 300s).
  3. Add the ratio: per stage (RT, RW, Kelurahan), median `net` over the median cost of that stage's unlocks; income growth over cost growth from stage to stage must sit within 0.7 to 1.5. Drop "is not measured" from the text.
- Done when: typecheck and harness tests pass, with one test for the ratio.
- Don't touch: item 14 and `nextKey`, `src/`, TODO.md. No e2e needed.

### T7. B0 novelty bar is two ticks (Haiku)
- Files: `GAME-DESIGN.md`, `tests/scorecard/scorecard.ts`, `decisions/scorecard-design-calls-T7.md`, `progress/scorecard-design-calls-T7.md`
- Exact changes:
  1. In `GAME-DESIGN.md`, replace `| B0 Hook | 0–1 min | First house by 30s | 10s, no popups | tutorial steps | n/a | n/a |` with `| B0 Hook | 0–1 min | First house by 30s | 16s (two ticks), no popups | tutorial steps | n/a | n/a |`
  2. In `tests/scorecard/scorecard.ts` line 63, replace `const NOVELTY_MAX_S = [10, 30, 30, 45, 60];` with `const NOVELTY_MAX_S = [16, 30, 30, 45, 60];`
  3. Search `tests/scorecard/scorecard.ts` for the text `bar 10, 30, 30, 45, 60` and, if found, replace it with `bar 16, 30, 30, 45, 60`.
  4. Write the decisions file: the sim moves in 8s ticks, so a 10s bar fails any 2-tick gap; content depth stays Fail.
- Done when: `npm run typecheck` and `npx vitest run tests/scorecard/harness.test.ts` pass.
- Don't touch: other bars, `src/`, TODO.md. No refactors. No e2e needed.

### T8. Item 12 counts reward kinds by category (Sonnet, executor trial)
- Files: `tests/scorecard/scorecard.ts`, `tests/scorecard/harness.test.ts`, `decisions/scorecard-design-calls-T8.md`, `progress/scorecard-design-calls-T8.md`
- Exact changes:
  1. Count kinds per star as distinct members of: non-decor building (`category !== 'decoration'`), decor, resource reward (`star.reward`), new system (a stage flag or verb the star opens; list how you found them in the decisions file).
  2. Add "a new system at least every 2 stars" to the check, per §8.
  3. List the stars still at one kind in the progress file. Do not change stage data.
- Done when: typecheck and harness tests pass.
- Don't touch: `src/data/`, TODO.md. No e2e needed.

### T9. Item 8 from hindsight ETAs (Sonnet, executor trial)
- Files: `tests/scorecard/scorecard.ts`, `tests/scorecard/harness.test.ts`, `decisions/scorecard-design-calls-T9.md`, `progress/scorecard-design-calls-T9.md`
- Exact changes:
  1. For each builder tick after minute 2: short = a `goal` event within the next 2 min; mid = a `star`, `sk` or Lomba event within the next 15 min. Pass if both hold in at least 90% of ticks, per §8.
  2. Long: the Emas bar (or the closest stored value; name it) changes at least once between consecutive stop points. If no such value is in the row, add it to the row in `driver.ts` and list the file under Files in the PR.
  3. Replace the `none(8, ...)` line with the verdict.
- Done when: typecheck and harness tests pass.
- Don't touch: `src/`, TODO.md. No e2e needed.

### T10. Item 16 spend proxy (Sonnet, executor trial)
- Files: `tests/scorecard/scorecard.ts`, `tests/scorecard/harness.test.ts`, `decisions/scorecard-design-calls-T10.md`, `progress/scorecard-design-calls-T10.md`
- Exact changes:
  1. From builder `built` events, sum `def(id).cost` per kind per band, excluding Rumah, Warung and Jalan Setapak. Fail if one kind has the top share in more than 2 bands.
  2. Evidence text says "proxy: spend share, not star time saved".
- Done when: typecheck and harness tests pass.
- Don't touch: `src/`, TODO.md. No e2e needed.

### T11. Item 18 compares rolled options on average (Sonnet, executor trial)
- Files: `tests/scorecard/scorecard.ts`, `tests/scorecard/harness.test.ts`, `decisions/scorecard-design-calls-T11.md`, `progress/scorecard-design-calls-T11.md`
- Exact changes:
  1. For options with rolled outcomes, use the probability-weighted mean of each resource change. Then run the same dominance check.
  2. Name any dominated option in the evidence, and give the verdict Pass or Fail, not Unknown.
- Done when: typecheck and harness tests pass.
- Don't touch: `src/data/events*.ts`, TODO.md. No e2e needed.

### T12. Item 24 old map keeps paying (Sonnet, executor trial)
- Files: `tests/scorecard/driver.ts`, `tests/scorecard/scorecard.ts`, `tests/scorecard/harness.test.ts`, `decisions/scorecard-design-calls-T12.md`, `progress/scorecard-design-calls-T12.md`
- Exact changes:
  1. At each promotion, note the uids of buildings that exist. 5 min later, sum the weekly income of those still standing.
  2. Item 24 passes the second half when that sum is above 0 for every promotion in 10 of 10 seeds. Drop "is T2" from the text and use `verdict`, not `partial`.
- Done when: typecheck and harness tests pass.
- Don't touch: `src/`, TODO.md. No e2e needed.

### T13. Diagnose the stuck shopkeeper seed and the two stalled takeovers (Sonnet, executor trial)
- Files: `decisions/scorecard-design-calls-T13.md`, `progress/scorecard-design-calls-T13.md`, and `tests/scorecard/driver.ts` only if the cause is in a bot
- Exact changes:
  1. Run `runBot('shopkeeper', 10, …)` locally and find the RT 2★ line it never meets, and why.
  2. Run the takeover test (`tests/scorecard/run-takeover.test.ts`) and find the 2 runs that gain nothing. Name the state and the cause.
  3. Fix it in `driver.ts` only if the bot is at fault. If the cause is in `src/`, write it up in the decisions file and stop.
- Done when: the decisions file names each cause. Typecheck and harness tests pass if `driver.ts` changed.
- Don't touch: `src/`, TODO.md. No e2e needed.

## Open questions
- Hidden combos (about 1 in 4) wait until items 7 and 23 pass. Then decide which combos to hide.
- Stars still at one reward kind after T8 need content. That goes in the next plan.
- The Kecamatan stars-only stop gap (78 min) belongs to the Kecamatan playtest work, not here.
