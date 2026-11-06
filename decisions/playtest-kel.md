# Playtest: Kelurahan 0★ to 3★, and the step into the Kecamatan

The rest of TODO item "Playtest the smaller map from RT 3★ to Kelurahan 3★ (T9)", after `decisions/playtest-rt3-kel1.md`. The owner asked for it to be played and fixed without waiting for a person.

## How it was played
As in `decisions/playtest-rt3-kel1.md`, following TESTING.md item 16:
- A screen playthrough from the Kelurahan dev save (Kelurahan 0★, week 180) at 360 x 640 in Indonesian. The agent read each goal line and its how-to, followed Inem's notes, answered events with the free choice, built what the step named, and helped RW 2 the way its how-to says (Menu, Neighbours, Auto-dana, bulk Dana and Kunjungan). It played on to Kelurahan 3★, accepted the SK and played 22 weeks of the Kecamatan.
- The nine player types: the scorecard bots' Kelurahan numbers are in `decisions/sebelah-step-hint-bot.md` (#326). This PR changes no sim rule a bot reads, so they were not rerun.

Opinions are kept apart at the end.

## Timeline (screen playthrough)
| Week | What happened |
| --- | --- |
| 180 | Kelurahan 0★. Goal: Serapan 80% for 48 weeks. |
| 194 | Kelurahan 1★, after 14 weeks. |
| 201 | Kelurahan 2★, after 7 more. Goal: win the area ranking 3 times. |
| 204 to 276 | Kelurahan Sebelah beaten in all 7 quarterly rankings, but the goal count moved only at weeks 192 and 240. |
| 288 | The third yearly win. |
| 289 | Kelurahan 3★, the SK, accepted. Kecamatan. Goal: build the Kantor Kecamatan. |

## Bugs found and fixed
1. **The quarterly report showed income as a loss.** The income chip put the trend arrow and a minus sign in front of the whole amount. A quarter that earned 887jt, a little less than the 897jt before it, read "▼ -887.786.516". The same happened at the RW, where 257jt read "-256.976.840" next to a C grade, which looks like the kampung is bleeding money. The income chip now shows the amount with only the arrow ("▼ 887.786.516"). The other chips are changes, and keep their sign. The report-card e2e test now sets a falling quarter and checks the chip has no minus. It fails without the fix.
2. **Ranking wins that do not count looked like they should.** From the RW on, only the yearly ranking (every 4th quarter) counts for the "win the area ranking N times" goal. Every quarter still shows "you beat Kelurahan Sebelah", and the goal pill said "win 3 area rankings". In the playthrough the player won 7 quarters in a row while the goal moved twice. The pill now says "yearly" (ID "menang peringkat tahunan wilayah 3 kali"). From the RW on, each ranking card ends with "The yearly ranking: it counts toward your star." or "Only the yearly ranking counts toward your star." The RT, where every win counts, is unchanged. Unit test in `tests/rw.test.ts`.

## Seen, not changed
- **Pace.** Kelurahan 1★ came 14 weeks in, under 2 minutes at 1x, and 2★ came 7 weeks later. Then 3★ waited 88 weeks on the calendar: two more yearly rankings. The stage was a quick climb and a long wait. Cash passed 5 miliar. This is GAME-DESIGN.md §8 rows 7, 10, 14 and 15, already on the scorecard list.
- **The Kelurahan dev save starts with an SK marked offered at 0★.** Promotion is not possible then, so the player sees nothing. This comes from the save, not from play.
- **Tim Audit.** The free choice ("show what there is") costs 2 Popularitas for each Wacana announced without a receipt. The how-to line says to keep every Wacana announced, which is clear.

## Opinions (agent, not data)
- The Kelurahan reads well once the yearly rule is visible. Before this fix, winning seven times and seeing the goal stay put felt like a bug.
- Cash stops mattering early here too: every choice priced in rupiah is free from about week 190.

## Verdict
Self-approved under the TODO rule. UI.md item 24 ("Every goal says how") is served by fix 2, and the report reads true after fix 1. TESTING.md: an e2e check for fix 1 that fails without it, and a unit test for fix 2. GAME-DESIGN.md is unchanged: it already says the RW and Kelurahan goals count yearly wins.

Left for a person: Hari's own play of the Kelurahan, for how it feels.
