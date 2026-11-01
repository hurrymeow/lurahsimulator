# Cheapskate bar: never stranded

Hari picked this on 2026-11-01. The old bar asked the cheapskate bot to reach every star within 2x of the builder. Neglect (no safety, no announcements, one build every 4 weeks) leaves Popularitas near 10 to 30 and the bot stops at RT 2★ with 52 of 55 residents. I tried a calm-week Popularitas gain; it did not move the bot, because resident expectations drain Popularitas faster than a passive gain.

New bar (GAME-DESIGN.md §8 item 17): the cheapskate reaches RT 2★ in at least half the seeds, and every takeover from a cheapskate game progresses. It does not have to reach RT 3★. The "above Popularitas 30" clause was dropped because the bot ends at 18 to 29.

Against: the bar now fits the result. The takeover check still catches a real soft-lock.

## Minimum gap on the ratio bar (Hari, 2026-11-01)
Item 17 compared the slowest and fastest of four bots per star, bar 1.3x. At RT 1★ the bots take 18 to 100 seconds, so the ratio was 6.5x on a gap nobody feels. A ratio above 1.3x now fails only when the gap is at least 2 minutes. Against: a long-tail star could hide a real imbalance; every star after RT 1★ still takes minutes, so the rule bites there.
