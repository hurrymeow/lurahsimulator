# Smaller map T4: save version 4

Bumped `SAVE_VERSION` to 4 because the smaller map changes how AI RTs are laid out, so v3 saves past the RT cannot be carried over faithfully. `deserialize` still accepts version 3 only when the save is at the RT stage, and upgrades it to 4 on load; a v3 save at RW or later is refused so the player starts anew. The three dev seeds were rewritten to version 4.
