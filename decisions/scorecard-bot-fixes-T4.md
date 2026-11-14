# Random bot lays paths at the start (T4)

The random scorecard bot now lays the standard Jalan Setapak grid on its first tick, from `playRandom`. It already answered events and maintained buildings but never built paths, so its placed buildings were cut off from the road and sat idle; with a road network it is judged on the same footing as the other bots and as a player. The change is a single guarded line at the top of `playRandom`; the rest of the random routine is unchanged.

Reviewer verdict: merged. Random RT 1★ 7 to 9 of 10 seeds, all 5 takeovers gain. The seed 3 and seed 5 stalls in decisions/scorecard-bot-fixes-T3.md came from maps with no paths; the off-road-plus-poor-cash game risk is no longer reached by any takeover, so it stays a note, not a task.
