# Rolling hills, volcanoes, clouds and a UI mockup

- Heightfield terrain behind the kampung, with lit facets and a tile grid (`cornerHeight`, `heightAt` in `src/render/scenery.ts`).
- Terraces follow the real hill height. Trees ride the hills and were thinned off the slopes; more trees and far details near the horizon.
- Dithered aerial haze over the far land, a soft hill silhouette and a soft distant tree line.
- Low, broad twin volcanoes with ravines and misty feet.
- Long, thin clouds that drift and twitch (`clouds()` in `scenery.ts`, drawn in `MapView.drawBackdrop`).
- `mockup.html` with `src/mockup/`: dev-only A-Train style in-game screen mockup. Open `/mockup.html` (`?lang=id` for Indonesian) on the dev server.
