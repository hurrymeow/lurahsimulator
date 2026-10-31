# Kecamatan map ring

The other three Kelurahan show as sprite blocks around the player's map, not as simulated tiles.

- Why: simulating three more 58x74 maps would break the Kelurahan frame-rate gate. The district numbers already live in `GameState.kec.districts`.
- Blocks sit east, south and in the corner. The ring only exists in the Kecamatan stage.
- A tap on a block opens a district card. The Tetangga panel lists the same cards.
- Open: Baliho judol ads show in the blurb only, not on the sprite.
