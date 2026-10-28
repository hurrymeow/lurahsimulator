# Build menu: owned count, NEW tag, ghost on select

Julian asked for three changes to how building reads and feels.

- **Owned count.** Every build card shows "N owned" ("N dimiliki"), or "N/max owned" for a capped building. Paths count tiles. It sits under the name, so it shows on locked cards too.
- **NEW tag.** The dot on the Build tabs is gone. A pixel sticker in the pixel font (mustard, a dark amber rim, a hard 2px shadow) hops one pixel and sparkles on a 0.9s step loop. It sits on the card, on its tab and on the dock's Build button, so a fresh unlock is found without opening the sheet. Reduce motion stops it. It is 16px like all text (UI.md rule 4). The first visit to Build still marks the starter set as seen, so a new game does not open with every card tagged.
- **Ghost on select.** Picking a building used to leave the map unchanged until a tile was tapped. Now its ghost appears at once on the best free spot: beside a connected road first, then nearest the middle of the view, panning there if it is off screen. Place is ready straight away, so the first house takes one tap fewer (UI.md rule 12).
- **Free spots light up.** Every tile a valid footprint can cover gets a faint cream diamond while placing, so it is plain the building goes on the grid.
- **The ghost breathes** (alpha and outline weight) and a 7-pixel mustard arrow bobs a whole art pixel over it. Both hold still with reduce motion. A blocked spot shows the ghost tinted red instead of hiding it.
- **Drag to move.** A finger that lands on the ghost carries it; anywhere else still pans. A mouse moves it by hovering. Tapping a tile still moves it.
- **Coach.** The Place step now reads "Here is a good spot. Tap Place, or drag it somewhere else." The opener skips straight to it, since the ghost is already placed.
- The dock label update targeted the button's last child, which is now the tag. It targets `.cs-dock-label` instead.
