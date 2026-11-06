# Viral soft cap

Viral gains shrink toward the cap (`src/sim/gain.ts`), so Viral no longer sits at 100 from late RT to the end. For the builder bot, B2 to B4 drop from 87 to 100% pinned to 0 to 7%, with the same star times. B0 and B1 still sit at 0 before the first Viral source. See `decisions/viral-soft-cap.md`.
