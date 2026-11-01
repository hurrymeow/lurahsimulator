# Kecamatan balance pass 1

Found by the Kecamatan bot (`tests/kec-bot-lib.ts`, run with `KEC_BOT=1`).

- **Pinjol idle rule (Hari picked option A).** A household is idle, and can borrow, only when most of its members have been idle for 24 weeks. One idle person in three was enough before. Pinjol sat at 30 to 47% and the 25% goal never opened. It now sits at 2 to 8%.
- **Crowd in the Kecamatan.** Crowd weighs 0.1 Aman per resident, down from 0.3, in the Kecamatan only. The goal asks for 250 residents, and at 0.3 the player's own Aman reads 0 above about 250 residents, so "Aman across 60" could not be met. At 0.1 the Aman run counts 100 to 370 weeks in the bot runs.
- **Why the bot had 43% jobless.** Not a design fault. The bot filled every tile with homes, so no job building fit. The Kecamatan bot now stops homes when more than 20% are jobless and pulls down a home to make room for work.
- **Ranking wins are trivial.** The area ranking runs every 12 weeks (`RANKING_WEEKS`), so "1 win" and "3 wins" are met within 3 weeks. Not changed here. Left for the playtest.
- **Open: Popularitas 35 for 2★.** The bot's Popularitas falls to 15 to 25 at 300+ residents, so 2★ is not reached. Needs a design call (lower the bar, soften the per-resident drain, or add Popularitas sources).
