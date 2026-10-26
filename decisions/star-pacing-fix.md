# Star pacing fix after #54 (main was red)

- Cause: #54 made some bot seeds stall below 2★. Sprawl at 5% per building past 8 slowed the second combo, and the Popularitas drain parked a hands-off kampung near 40, under the 2★ goal of 50.
- Sprawl now starts at the 10th building and adds 3% each. Setoran is 10% (was 12%). Expectations drain is 0.09 per resident (was 0.1).
- The test bot now plays Popularitas like a player: below 55 with cash in hand, it announces the cheapest policy (Kampung Hijau) every third month. Policies are the intended lever, so a bot that ignores them was the wrong yardstick. The test threshold is unchanged.
- Result over 10 seeds: 1★ month 5, 2★ months 24 to 43, 3★ for 7 of 10 within 8 years.
