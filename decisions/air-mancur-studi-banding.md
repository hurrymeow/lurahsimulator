# Air Mancur and Studi Banding redesign (2026-11-09)

Koko asked for more interesting shapes for both, and a rounder top for Air Mancur. I drew three local options for each (`docs/plans/air-mancur-studi-banding/options.png`), and Koko picked:

- **Air Mancur: Payung Air** (option C). A lotus pool, a slim column with a gold bud, and an umbrella dome of water. The basin is 1px smaller than in the review render, to keep it inside its tile (`tests/footprint-art.test.ts`).
- **Studi Banding: Bus Pariwisata** (option A). A tour coach with a luggage rack and the rombongan posing for the photo.

Kept as backups, in case these two ever get levels: **Bola Dunia** (option B) and **Kunker ke Luar Negeri** (option C). They are exported from `src/render/landmark-art.ts` as `bolaDunia` and `kunkerLuarNegeri`, but not registered. Dropped: the tiered fountain (A) and the terop tent (B).

The old sprites are gone: `airMancur` in `art-content.ts` and `studiBanding` in `art-higher.ts`.

Updates the docs: ART.md, Building levels.
