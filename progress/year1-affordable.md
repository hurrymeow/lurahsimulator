# Year 1 affordability pass

- Played year 1 in the browser and with a scripted builder; logged every price shown against the cash on hand.
- IndoApril and BetaMart open at RT 2★ instead of 1★.
- Menara Wifi 2.5 juta (was 3.5), Kos-kosan 3 juta (was 4), Biopori Massal 1.5 juta (was 2.5), Pelatihan UMKM 2 juta (was 3).
- `tests/balance.test.ts`: new guard that every 1★ unlock is affordable within 16 weeks. `tests/stages.test.ts` follows the new gate.
- GAME-DESIGN.md sections 2 and 3 updated. Why and the numbers: `decisions/year1-affordable.md`.
