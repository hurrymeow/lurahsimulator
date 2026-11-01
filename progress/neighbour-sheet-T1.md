# AI RTs have no ranking goal

Shipped the T1 part of the Neighbours sheet plan: `neighboursSystem` filters `rankWins` and `winStreak` from an AI RT's star goals through the exported `aiGoals` helper, and a new test in `tests/grow.test.ts` checks that an AI RT meeting every other RT 2★ goal gains its 2nd star with no ranking win. Typecheck and `npm test` pass, including the RW and Kelurahan bot tests.
