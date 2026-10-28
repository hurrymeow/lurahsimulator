# House silhouettes and rumah levels

- **Rumah levels up to 3.** Asked for by the owner after the housing sprites read as one shape. Level 2 adds a teras, level 3 a second floor. Beds go 3, 5, 7 through the new `housingLevels` field; `bedsOf(b)` reads it, and housing, the demolish check and the inspector use it. Attract scales by level like every building. The upgrade costs the build price times the current level, as for every building. No star gate.
- **Rumah has its own level art** and is in `LEVELLED`, so it no longer gets the fence-and-wall upgrade kit (it never levelled before, so no save changes look).
- **Kos-kosan is tall from level 1:** two floors under a pelana with an outside stair, then a third floor with a flat dak, tandon and jemuran. Before, level 1 was a wide low row that read as a big rumah.
- **Kontrakan stays as it is** (the owner's call). A row-house version with party walls through the roof was prototyped and dropped.
- Both house changes stay within the one-storey and 28px rules in ART.md; `tests/art.test.ts` covers them and a new test checks the roof-shape rule at every rumah level.
- ART.md (Building levels, Roofs and walls) and GAME-DESIGN.md (Stage 1 RT, 0★) updated.
