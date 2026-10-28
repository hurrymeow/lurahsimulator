# Stat words become HUD icons

- A stat word in running text becomes its HUD icon, in both languages.
- Heart (`sabar`) is Popularitas, flame (`viral`) is Viral / Virality,
  key (`orangDalam`) is Orang Dalam / Orang Inside, coin (`rupiah`) is
  Rupiah and income. Sim ids and saves are unchanged.
- One renderer, `src/ui/statIcons.ts`, does it everywhere: a
  MutationObserver on document.body decorates new text nodes and text
  changes, so popups, toasts and sheets are covered without editing
  about 350 strings by hand.
- The icon span carries the word only in `aria-label` and `title`, never
  in a text node, so the observer cannot loop. Text it creates is
  stat-free, except a `{plain:...}` escape, which becomes a `data-plain`
  span the observer skips.
- Matching is whole-word and case-sensitive. Lowercase "viral" in
  flavour text (a video goes viral) stays a word. "Rp 40rb" is a
  different token and is never replaced.
- An icon and its adjacent number join in one nowrap pair, so they
  never split across lines. The rest of the sentence still wraps.
- Tapping an icon shows a one-line toast "[icon] = Popularitas". The
  icon tap is auxiliary info, not a required action, so the 48px rule
  for frequent actions does not turn every inline icon into a button.
  The label is also in `aria-label` for screen readers.
- Buku Combo tiles are data-driven, not text: `perMonth` renders as
  [icon] +n /bln (EN /mo), `incomeMult` as [shop icon(s)] [coin] x1,5.
  Negative values show a minus sign, never colour alone. `cEffect`
  stays as the tile's `aria-label` and as the fallback for combos
  without data (17 Agustus prize, banjir protection).
- Canvas and coach, checked: map pops already draw icon plus number,
  walker bubbles carry no stat words, coach text is DOM and is
  decorated by the observer. No canvas change in PR 1.
- Docs: `decisions/resource-names.md` Icons section is updated in
  this PR, because it still said envelope and phone. That is a doc
  update, not a silent divergence: the shipped HUD icons are coin,
  heart, key, flame and person.
- Open work left behind, added to TODO.md in this PR: PR 2 verifies
  and fixes buildings, events, jobs, staff, mangkrak, calo, Wacana
  and Realisasi, including rewording sentences that read oddly with
  an icon noun and the "Lubang Viral" / "Viral Pothole" title. PR 3
  covers stage goals, Kelurahan and RW goals, the stats explainer
  (which keeps one word-plus-icon legend), How to play and the
  report card.

## Result rows (review fix)
The event-result e2e check used to need visible text in `.outcome-name`. A stat word there is now an icon, so the check accepts the icon's `aria-label` as the name. The row still shows icon plus number, which meets UI.md rule 6.
