# Combo effects stack at most 3 times

Found by the scorecard: on seed 4 the builder bot spammed 34 wifi towers. Every tower started a Perang Kuota price war with a neighbour. Each war cost 1 Popularitas a week, so 34 wars drained 34 a week. Popularitas hit 0, residents left, and the town stuck at 2 residents for good.

Decision: a combo's monthly effect applies at most `COMBO_STACK_MAX` (3) times per combo id. Income multipliers on members are unchanged. One copy of each combo behaves as before.

Why: a spam of one building kind should be a poor plan, not a death spiral. Positive combos are capped the same way, so no combo becomes a snowball by copying it.

Counter-argument: a player who builds many copies of a good combo now earns less than before. That is the intent, and the scorecard's "meters stay in play" row (5) tracks it.
