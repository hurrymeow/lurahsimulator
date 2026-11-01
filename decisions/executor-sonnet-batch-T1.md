# Wifi Tower needs no road

GAME-DESIGN.md section 2 already says the Menara Wifi needs no Jalan Setapak ("a mast needs power, not visitors"), and `decisions/playtest-sk2.md` recorded the same call, but `src/sim/access.ts` still flagged every RT-scope building. Added an optional `roadless` flag to `BuildingDef`, set it on `wifi` in `src/data/buildings.ts`, and made `needsRoad` return false for such a def. No doc change was needed: the code now matches the docs.
