# 90s special hires and a portrait for every special

- `src/data/staff.ts`: six new 4★ specials, 90s TV and radio types (Bang Lawak, Om Lalu Lintas, Bu Juru Ketik, Pak Kuis, Mbak Senam Pagi, Bang Rental PS).
- `src/render/portraits.ts`: a 44x60 portrait for every special, painted from parts with coloured outlines.
- `src/ui/staff.ts`: specials show their portrait on their card and as an applicant.
- `src/i18n/id-content.ts`: their types and quirks in Indonesian.
- `GAME-DESIGN.md`: the specials line.
- Tests: `tests/portraits.test.ts` (every special has a portrait, sizes, no pure black, all distinct, the new types have real roles).
- Why types and not real people or others' characters: `decisions/staff-portraits.md`.
