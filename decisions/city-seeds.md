# City-style dev seeds

The seed bot (`tests/seed-bot.ts`) now plans the RT: Jalan Setapak streets every fourth row with a spine through the Kantor, one of each building kind in turn (houses up to 8, other kinds up to 4), road-fed buildings beside a street nearest the Kantor first, decor and flat pieces in the gaps. Stars are set before the bot plays, so every kind the stage opens is built. Cash is topped up while it plays and reset to the old end values (5jt, 20jt, 45jt), so the seeds no longer end rich.

Seeds now have more kinds (rt3 10 from 7, rw 18 from 10, kel 29 from 11) and residents (45, 87, 60; were 26, 36, 42), because the plan houses more people. A test checks that no seed building lacks road access and that each seed has a minimum number of kinds.

Follows the docs. Source: TODO "Make the dev seeds look like a proper city".
