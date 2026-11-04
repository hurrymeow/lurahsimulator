# Staf in the dock

Builds the dock part of the SK 2 playtest note: "Keep the Bangun button's size; make room for Staf" (`decisions/playtest-sk2.md`). UI.md and GAME-DESIGN.md already said this, but the code still had Build, Warga and Menu.

- **Build keeps its width.** It stays at a third of the bar, the width it had with three buttons. Warga, Staf and Menu share the rest equally, about 62px each at 320px.
- **The applicant count moves to the Staf button.** Menu only counts its own panels, so it would have lost the count.
- **Staf uses the people icon it had in the Menu.** It is close to the Warga icon. A staff icon can come with the art work.
- **Beyond the note:** "Residents" does not fit 62px, so the English dock label is "People" (`dock.warga`). The sheet title stays "Residents", and How to Play now says "People". Indonesian stays "Warga".
