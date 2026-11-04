# Urusan Pribadi: experience asks, the 3-heart perk, loan shops

TODO item "Urusan Pribadi: the rest of the spec". Spec: `decisions/staff-requests.md` section 2. First slice: `decisions/urusan-pribadi.md`.

- **Experience asks** (new kind `experience`, weight 1 like the other rare asks; lines from the spec's bank):
  - line 0, "send me to the Kecamatan": yes promises to send them on 3 send-events. Every send counts, win or lose (`keepPromise` from `resolveEvent`).
  - line 1, "ketua panitia Agustusan": yes promises the chair. It is kept in August with them at work and a working Lapangan for the stage.
  - Yes costs nothing now and gives no heart now. The heart comes when the promise is kept. A promise not kept within 52 weeks breaks: a heart goes, with a card. While a promise is open, that person makes no new ask.
  - The person view shows the open promise, and the help line under Yes says "Akrab +1 when you keep it, -1 if a year passes".
- **3-heart perk:** at 3 hearts a special's output is ×1.25 (their quirk upgrades), a generic hire's ×1.1 (a perk), and neither can be poached while the bond is full. A card says so once (`perkSeen`). It goes with the third heart if that heart is lost.
  - Simpler than "the quirk upgrades" in the spec: one multiplier on the quirk's output rather than a new quirk text per special.
- **Loan shops:** a repaid loan has a 35% chance its side business opens a Warung Sembako on a free tile beside a connected road, at no cost, with a card. No free tile, no shop. Over 40 seeds at high Jujur the test sees between 6 and 29.

Verdict (self-approved): `tests/requests.test.ts` covers both promises, a broken promise, the perk card, output and poaching, and loan shops; every new line is in both languages, and request lines stay at 20 words or fewer.
