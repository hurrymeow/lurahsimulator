# Two goals and the first combo hint

- The goal strip shows two lines: "Now" (a goal for the next minute) and "Next ★" (the star checklist line, as before).
- "Now" climbs a short ladder in `src/sim/nextstep.ts`: first Rumah, the first combo, wait for a build, more beds, then residents in steps of 3.
- At month 30 (4 min at 1x) with no combo found, "Now" names the cheapest combo the player can set up and lists its buildings. Cost is the money for pieces they lack.
- The celebration is the existing combo fanfare notice. No new celebration code, so the first-win threads are not touched.
- The strip stays hidden on the home screen (#73 rule untouched).
