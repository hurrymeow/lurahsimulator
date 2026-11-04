# Urusan Pribadi: staff ask for things (first slice)

TODO item "Urusan Pribadi: personal requests and Akrab" (voidinside99). Spec: `decisions/staff-requests.md` section 2.

## Shipped
- **When:** from level 2, each hire (not Inem) brings a request about every 24 weeks. At most two are open across the staff, at most one new ask comes a week, and each has a 4-week deadline. A lapsed deadline counts as a no.
- **How it looks:** a card with the ask in their own words, and a button to the Staff panel. The staff row shows a chip, "Ada urusan pribadi". In the person view, the ask is a speech bubble, with Yes (the primary, unless a raise also waits) and "Nanti dulu".
- **The asks:**
  - cuti: 2 to 4 weeks away;
  - a business loan;
  - a course (Bimtek), which adds to the work stat;
  - 1 Orang Dalam, 5 Viral or 3 Popularitas.
  - Traits tilt them: Healing Mulu asks for cuti, Si Paling Grup WA for Viral, Titipan for Orang Dalam.
- **Akrab, up to 3 hearts:**
  - Yes adds a heart, and each heart is +3 to the work stat.
  - No takes a heart (and its +3) away and marks them as open to a poach, as a refused raise does. A Baperan leaves at once.
- **Loans:** after 12 weeks a loan comes back with 30% interest, or is gone. The chance it comes back is 25% plus Jujur/200.
- **Cost cap:** a loan or course costs Rp 1.5 million at today's prices, never more than a fifth of the kas.
- **The line bank:** the Indonesian lines are from the spec. The English lines keep each joke and are not word-for-word. Every line is 20 words or fewer (UI.md rule 13).
- **Stars:** requests never block a star.

## Not in this slice
These stay in the TODO item:
- The "experience" asks (be sent on 3 send-events, or be ketua panitia), which need counting across systems.
- The 3-heart perk or quirk upgrade.
- A loan's side business becoming a shop on the map.
- The portrait on the request card. The card is the plain notice card; the portrait shows in the Staff view the card opens.

## Verdict (self-approved)
- `tests/requests.test.ts` covers timing (level, the two-open cap, one a week, Inem), hearts and their stat, Baperan, a lapsed deadline, loans over 40 seeds, and every line in both languages at 20 words or fewer.
- The e2e test shows the chip and the bubble, checks they are legible, and checks that yes pays the loan and adds a heart.
- `npm test` passes (609).
