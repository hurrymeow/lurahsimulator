# Random bot lays paths at the start (T4)

The random scorecard bot now lays the standard Jalan Setapak grid on its first tick, from `playRandom`. It already answered events and maintained buildings but never built paths, so its placed buildings were cut off from the road and sat idle; with a road network it is judged on the same footing as the other bots and as a player. The change is a single guarded line at the top of `playRandom`; the rest of the random routine is unchanged.
