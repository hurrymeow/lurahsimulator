# RW playable

- **Added a fourth RW combo, Pos Siaga (Posyandu + Portal, radius 3, +1 Sabar and +1 Viral a month).** RW 2★ needs 2 RW combos, but the data only had one that a 1★ player can build. Jalan Ditutup needs Pasar Kaget and Agustusan Akbar needs Gapura, and both open at 2★. Flipping `playable` on that data would have dead-ended every game.
- **Two AI RTs always share a trait.** Grup Chat Warga needs two neighbouring RTs of one trait. Three random draws from three traits miss a pair in 22% of games, so `promote` copies the first trait onto the last when all three differ.
- **Grup Chat Warga counts any two AI RTs in the RW.** Not only adjacent ones. The radius is 99 and the Buku Combo says "the whole RW".
- **AI RTs alternate houses and shops.** The old rule built a house whenever population caught up with housing. Population catches up within a month, so a funded RT built nothing but houses and never found a combo. The RW 1★ and 2★ goals need all four RTs at 1★, so this was a dead end too. A new shop also goes on the free tile that touches the most different neighbours, which is how a player finds combos.
- **Posyandu has two effects.** The player's RT gets +1 Sabar a month per level. An AI RT's modelled Sabar gets a flat +3 per level, because that Sabar is a formula and not a running total.
- **Portal counts once.** Two portals do not stack to x0.49. Ojol income is x0.7 while any portal works.
- **Jalan Ditutup zeroes ojol in the Pasar Kaget burst month.** STAGES.md says "that month". Reading it as the month the road is shut keeps the cost to one month in four.
- **Burst month is `month % 4 == 3`** for every Pasar Kaget, so the player can plan around it.
- **Agustusan Akbar stacks with Lapangan.** The combo adds x2 to the Lapangan's x2, so the prize is x4 with both.
- **Kader Apresiasi is paid for you.** At year end each Kader costs Rp 300.000 if the kas can cover all of them. If it can't, output falls 20% (floor 20%). A paid Apresiasi resets the fall. There is no button, because the choice is the kas balance.
- **Calo slot comes from the Balai RW (1 per level), Kader slots from the Posyandu (2 per level).** Calo is never auto-picked. A scandal ends the job.
- **Kerja Bakti boosts the selokan's flood protection.** The selokan has no income, so the data's x1.2 modifier multiplies its banjir protection instead.
- **Pendataan Warga pads the player's RT score only,** by the reported percent of residents, for 12 months. AI RTs are unaffected.
- **Musim Pindahan multiplies the Stempel backlog each build adds,** for 2 months.
