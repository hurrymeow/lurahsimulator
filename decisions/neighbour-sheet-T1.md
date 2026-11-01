# AI RTs have no ranking goal

AI RTs now earn stars from the RT checklist with `rankWins` and `winStreak` filtered out (`aiGoals` in `src/sim/grow.ts`), because the player cannot act on another RT's yearly ranking and the Neighbours sheet revamp needs the same filter. The player's own RT star check and the AI's area-ranking score are unchanged, so AI RTs still count in `areaScore` and still record `n.ranking`.
