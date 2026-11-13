# T1: rival chases the player

From the RW on, the rival's quarterly score never falls below `RIVAL_TRACK` (0.9) of the player's last score in that stage, using the latest `s.ranking` entry whose `tier` matches the current stage. This keeps a strong campaign chased instead of letting it coast, while the RT keeps the calendar-based rival so existing behaviour and tests are unchanged. The value 0.9 is a first pass; tuning belongs to T2, not this change.

## Review
Diff read in full against the plan's Exact changes: constant, one guarded line in `yearlyRanking`, three tests, no other files. Matches. Tuning stays with T2 (Nightly).
