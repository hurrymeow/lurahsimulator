# Selokan is back, with new art

- The anti-Banjir drain is named Selokan again, in both languages. The internal id stays `biopori`, so saves, unlocks and Kerja Bakti targets need no migration. Mechanic unchanged: works on one tile, no road access needed, each level cuts banjir damage 20%.
- New sprite `drain` in `render/art-content.ts`: concrete kerbs with slab seams, water with a shaded wall and ripples, and a small plank bridge. It runs edge to edge so neighbours join up, and a column turns with the `y` variant like the old selokan did.
- The Build menu puts Jalan Setapak first on the opening tab, and first on its own Decor tab.
- Tip pop-ups lose the Skip tips button. "Tap to continue" is the only way through. The tips `off` flag is gone, so old saves that had switched tips off see them again.
