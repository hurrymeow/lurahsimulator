# TODO

Open tasks and ideas that are not done yet. When you start one, remove it from this list in the same PR. Add any open work you find or leave behind. Shipped work goes in `progress/`, decisions in `decisions/`.

## Tasks

- **Desa ring.** The sawah and kebun ring on the Desa path is not built. Source: GAME-DESIGN.md section 7, `progress/desa-path.md`, `progress/kelurahan-playable.md`.
- **Kelurahan 2★ and 3★ balance.** `tests/kel-bot.test.ts` only checks 1★. Add bot runs for 2★ and 3★ and tune until they pass. Source: `progress/kelurahan-playable.md`.
- **RW 3★ balance.** Unchecked, because it needs 2 AI RTs at 3★. Source: `progress/rw-playable.md`.
- **Human-timed run for pacing targets 1 and 10.** First house within 30s of New Game is only an estimate (25 to 35s). Star unlock affordability is not measured. Source: GAME-DESIGN.md section 3, Open work.
- **Playtest the Kelurahan, then decide on Kecamatan and above.** Only stages 1 to 3 are specified. Source: GAME-DESIGN.md section 1 and section 7.
- **Range checks from top corners.** Combos now measure range edge to edge (`decisions/combo-range-and-move-look.md`), but the minimarket Kanibal penalty (`src/sim/brands.ts`) and decoration boosts (`src/sim/state.ts`) still measure from each lot's top corner, so a 2x2 or 3x3 neighbour counts as farther than it looks. Switch them to the same edge-to-edge rule.
- **Flaky walkers e2e.** `walkers and effects › residents walk the map and ojol riders join them` (`tests/e2e/ui.spec.ts`) fails about 1 run in 4 locally on main too, at 320px id and 430px en. Find the race and make it robust.

- **Say why the population stalls.** Arrivals need population below attraction (`attractTarget` in `src/sim/state.ts`). The HUD chip shows beds (`13/15`), so a stall at attraction 12 looks like a bug. When population is at or above attraction, `shortGoal` (`src/sim/nextstep.ts`) should say what to add, for example a Warung. Keep it out of the 320px chip. Source: 16-min playtest, 2026-10-28.
- **Explain big drops in the 2045 meter.** The meter is the average of Perut, Kerja and Aman (`src/sim/needs.ts`). A Warung that loses its road or gets damaged leaves `isWorking`, so Perut falls and the meter jumps (58 to 22 in the playtest). Show a toast naming the cause when the meter drops 10 points or more. Not verified against a replay. Source: 16-min playtest, 2026-10-28.
- **Force the update with a full-screen screen.** The update banner (`src/pwa/update.ts`) stays all session unless clicked. Hari wants a forced update: a full-screen "Update now" screen with one button, not a dismissible banner. Decide when it shows (home only, so play never reloads mid-session). Source: 16-min playtest, 2026-10-28.

## Ideas

- **English e2e on a schedule.** CI now runs Indonesian only (`decisions/default-lang-id.md`). A nightly or weekly workflow could run the `-en` projects so English clipping is still caught without slowing PRs.
- **Skip screenshot baselines outside CI's image.** Local `npm run e2e` always fails `visual.spec.ts` because fonts render differently. Skip it unless `CI` is set, or say so in the run output.
- **Tune `GRADE_BONUS`** if the economy feels thin after grade bonuses went half-yearly. Source: `decisions/41-half-year-report-night-tint.md`.
