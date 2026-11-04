# Quest chains for the named specials (first slice: the linked pair)

TODO item "Quest chains for the named specials" (voidinside99). Spec: `decisions/staff-requests.md` section 3. The TODO asked to start with the linked pair.

- **The framework:** `src/sim/chains.ts`.
  - Each chain is three checks, in order. They are checked weekly, at most one step a week, never while the special is away.
  - Each finished step gives a toast. The last pays out with a card that opens Staff.
  - The progress lives on the staff member (`chainStep`, `chainDone`), so it stays with them through Mutasi.
  - Chains never gate stars.
- **Pak Purna, "37 Tahun di Meja yang Sama":**
  - Steps: he reaches level 3; Bu Juru Ketik is on the staff to type it; the launch needs a working Balai Warga or Balai RW and Popularitas 50.
  - Payoff: his Lobi +10, and Popularitas +5 from the launch. The spec's "book-launch event" is this card for now.
- **Bu Juru Ketik, the old typewriter:**
  - Steps: she reaches level 2; Bang Rental PS is on the staff; a working Bengkel supplies the parts.
  - Payoff: her desk folders count twice, through `output()`, as an Asisten.
- **Where it shows:** the special's person view has a "Mimpi" section with the three steps ticked as they are done, and the reward line.
- **Not in this slice:** the other eleven chains in section 3. They stay in the TODO item.

Verdict (self-approved): `tests/chains.test.ts` covers both chains: each waits on the other special, then pays as written. It also checks every line in both languages. `npm test` passes (612). The Staff specs pass at 320px ID and 412px EN.
