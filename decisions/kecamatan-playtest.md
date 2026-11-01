# Kecamatan playtest (bot) and slice 2 proposal

Bot playtest of the Kecamatan, 2026-11-01. The bot (`tests/kec-bot-lib.ts`) plays the Kelurahan to 3★, promotes, then plays the Kecamatan. Hari's T3 check by hand is still open. Bot runs were seeds 3 and 4 (identical star times).

## Results against the B5 bars

| Bar | Target | Bot | Verdict |
| --- | --- | --- | --- |
| 0★ to 3★ at 1x | 55 to 65 min (fail below 45 or above 70) | 3★ at week 425 = **56.7 min** | Pass |
| Star gap | 15 to 25 min | 15, 18 and 23 min (weeks 113, 250, 425) | Pass |
| Novelty max | 90s | longest wait **56s** (7 weeks) | Pass |
| Goal max | 5 min | longest wait **23 min** (175 weeks, 2★ to 3★) | **Fail** |
| First pinjol case | within 3 min of promotion | not measured | Open |
| Stop point | every 20 min | not measured | Open |
| Weighted first-seen points | 6 per 30 min | not measured | Open |
| 10 of 10 seeds | 3★ in 45 to 70 min | seeds 3 and 4 only. Seeds 5 and 7 never reach Kelurahan 3★ in the Kelurahan bot | **Not met** |

## Findings

1. **The district clock sets the pace.** The slowest Kelurahan needs 340 / 0.8 = 425 weeks for 3★. A player who meets the other goals earlier just waits. That is why 3★ lands at 56.7 min on every seed.
2. **Goal gap of 23 min.** From 2★ (week 250) to 3★ (week 425) no checklist line completes: the Kelurahan stars come on the district timers, and the other lines (pinjol under 10%, Aman 65, no razia for 48 weeks) are already met. Fix in slice 2: add lines that complete on the way, for example one per modelled Kelurahan reaching 3★, or a milestone line such as Aman 65 for 24 weeks.
3. **Pinjol was a problem for the wrong reason.** The first pass made one idle person in three put a household in debt. Pinjol sat at 30 to 47%. Fixed (option A). With work for everyone it falls to 0 to 4%.
4. **Pinjol is easy once people have work.** The bot never needed a razia (0 in the final runs). The razia, Literasi and Koperasi are not the only way out: building jobs solves it. Whether that is the intended answer needs Hari's hands-on check. Judol was not measured.
5. **Crowd and Popularitas fought the 250-resident goal.** Fixed with a lower crowd weight and 0.6x drain in the Kecamatan.
6. **Ranking wins were trivial.** Fixed: only yearly rankings count.
7. **The bots are weak at jobs and space.** A plain bot fills the map with homes and leaves no room for work (43% jobless at promotion). The Kecamatan bot now stops homes and swaps one for a job building. A player would too.

## Proposal for slice 2 (Kabupaten)

- **Fix the goal gap first.** Split the 3★ wait with checklist lines that finish on the way (finding 2).
- **Make the Kecamatan verbs matter.** Pinjol only bites when people are idle. Tie some pressure to Viral or Baliho income so the razia, Literasi and Koperasi still have a job when the kampung is employed. Needs Hari's call.
- **Read judol numbers.** Measure judol share and Baliho income in the bot before adding Kabupaten pressure on top.
- **Bots first.** Fix the Kelurahan bot so it reaches 3★ on all seeds, then run the 10-seed check in the nightly job.
