# Rolling hills, twin volcanoes, drifting clouds, UI mockup

- The land behind the ring road rises into hills, drawn as two flat-lit triangles per tile with a soft grid line on each tile edge. Reference: the terrain of a 90s train-and-city builder.
- The kampung, the ring road, the front sawah and the coast stay flat. Tapping, placement and draw order do not change.
- Trees stand on the hill surface. Palms and pisang keep to the low kebun by the ring road, shade-tree groves sit on hilltops, and steep faces stay bare so the hills read. More trees, small far tree clumps and three tiny hamlets fill the band below the horizon.
- The far land fades into the horizon haze through an ordered dither. The hill silhouette has no ink line: it frays into the sky in a few dithered pixels instead. The repeating pine-triangle tree line is replaced by a soft, rounded tree line in the haze.
- The twin mountains are now low, broad volcanoes after an old painting of a Javanese gunung: concave slopes, a blunt crater top, light from the left turning warm white to pale blue with no ridge line, faint ravines, and a base that melts into haze. Octopath Traveler's distant vistas set the haze and the soft tones.
- Clouds are long, thin, tapered streaks instead of round puffs. They are drawn per frame so they slide slowly to and fro and twitch a pixel now and then. They hold still with reduce motion and never cover the sun's face.
- `mockup.html` is a dev-only test render of the in-game screen in a train-and-city builder's cream console frame (build palette, satellite view, status box, two-line tabs) around the live map. It is not in the build and not wired to the game yet. Its tab captions are 12 to 14px, under the 16px body rule, so it needs a pass before it replaces the real HUD.
