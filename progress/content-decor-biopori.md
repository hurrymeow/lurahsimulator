# Decorations, Orang Dalam cost, biopori

- 9 decorations: Pot Bunga, Pohon Rindang, Bangku Taman, Lampu Taman, Mural Kampung, Kolam Ikan Hias, Taman Bermain, Air Mancur, Patung Ikon Kampung. Each lifts income of nearby shops and farms, drawn to ART.md, EN and ID text.
- `boost` and `orangDalamCost` on BuildingDef. Orang Dalam is spent on placing the Patung.
- Biopori replaces the selokan everywhere (banjir, inspection, combos, AI RTs, how-to), with save migration.
- Tests: `tests/content-engine.test.ts` (migration, aura radius and cap, no ranking boost, OD cost).
