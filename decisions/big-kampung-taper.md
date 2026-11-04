# A big kampung can always get back over the Kelurahan 3★ Popularitas bar

TODO item "Stop a big kampung getting stuck under the Kelurahan 3★ Popularitas bar" (#204, `decisions/kelurahan-own-kampung.md`).

## What the bots showed (2026-11-04, after the smaller map)

- The normal Kelurahan bot no longer gets stuck. Seeds 1 to 13 all reach 3★ in week 145, with 236 to 257 residents and Popularitas 39 to 48. The yearly Piala wins set that week.
- A greedy builder who adds Kontrakan whatever Popularitas says also reaches 3★, at about 260 residents. Arrivals need Popularitas, so beds alone do not overgrow a kampung.
- The soft-lock is still real when a kampung gets much bigger. With 180 extra warga at 2★ (about 310 residents), Popularitas settled at 29 to 31 for 300 weeks on two seeds of three. With 280 extra (about 410), it settled at 26 to 28. Residents only leave under 15, so nothing moved it back over 35.

## Change (updates GAME-DESIGN.md, sections 2 and 5)

1. **Expectations taper at the Kelurahan:** residents past **200** expect half as much (`EXPECT_TAPER` in `src/sim/balance.ts`). The 3★ goal itself is 200 residents, so the warga past it are bonus, not a burden that grows forever. On its own this frees the 310 case (Popularitas back to 35 to 39).
2. **No bed, no stay:** at the Kelurahan, while residents outnumber beds, one warga a week moves to the neighbours. The toast says "{name} moved next door: no bed" (6 words). This frees the 410 case. A kampung with enough beds never sees it.

The Kecamatan keeps its own tuning (0.6x and no taper), because `decisions/kecamatan-balance-1.md` and `-2.md` balanced it without one.

Under AGENTS.md's Conformance protocol this is option 2 (update the doc). The owner said on 2026-11-04 to work through TODO.md without checking back, so the agent chose it. GAME-DESIGN.md is updated in the same PR.

## Verdict (self-approved under the TODO approval rule)

- `tests/kel-bot.test.ts` now asks for all three seeds (was two of three) to reach 3★ in weeks 120 to 180. A new test pushes 280 extra warga in at 2★ and asks all three seeds to still reach 3★. Both pass.
- `npm test` passes in full, including the RW, Kecamatan and balance bots.
- GAME-DESIGN.md §8 item 8 ("never soft-lock") holds for the Kelurahan Popularitas bar.
