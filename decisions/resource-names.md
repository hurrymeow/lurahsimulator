# Resource names

| Resource | EN | ID |
|---|---|---|
| sabar | Patience | Kesabaran |
| orangDalam | Orang Inside | Orang Dalam |
| viral | Virality | Viral |

Applied to every player-facing string: chips, explainer cards, how to play, report card, event outcomes, building, combo and job text. Code ids (`sabar`, `orangDalam`, `viral`) and saves are unchanged. Slang in flavour text stays.

## Icons
The HUD icons are the stat icons, 16x16, from `ICONS` in `src/render/sprites.ts`:
coin (`rupiah`) for Rupiah and income, heart (`sabar`) for Popularitas,
key (`orangDalam`) for Orang Dalam / Orang Inside, flame (`viral`) for
Viral / Virality, person (`people`) for warga. In running text a stat word
becomes its icon (`src/ui/statIcons.ts`), with the name in `aria-label`
and `title` only, so the word never appears as text. This replaces the
earlier envelope-with-cash and phone-with-heart picks, which were never
shipped as HUD icons.
