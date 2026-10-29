# RW 3★ and Kelurahan 2★/3★ bot runs

Julian, 2026-10-29. TODO items "RW 3★ balance" and "Kelurahan 2★ and 3★ balance".

- **RW 3★:** with Auto-dana at 6 (#145), the RW bot reaches 3★ in all 5 seeds at months 76 to 95. No tuning needed. The test asks for 4 of 5 seeds within 9 years.
- **Kelurahan:** every seed stalled at 1★ on "a clean Tim Audit", even with all 15 RTs at 3★. The audit was a random event in months 2 and 9 sharing the random pool, so in 13 years of play it never came. A star goal must not wait on luck, so the **Tim Audit is now a yearly scheduled visit every March from Kelurahan 1★**. The free choice is clean when every wacana has its receipt, as before. With it, all 3 seeds reach 2★ (months 66 to 88) and 3★ (months 93 to 115). The test asks for 2★ in all 3 seeds and 3★ in at least 2 of 3, within 10 years.
- **Crash found and fixed:** an AI RT's view listed its warga as empty slots. Once a Kelurahan combo that needs a job became live (after 2★), reading `r.job` on a slot crashed the month. The slots are now jobless stand-in residents.
- Note: a yearly March audit sits 5 months from 17 Agustus, which is clear of the Lomba spacing rule (#152).
