# Simplify the build menu and paths

- Build has 4 tabs: Housing, Shops, Facilities, Decor. Farm folds into Facilities, paths and drains into Decor. The `BuildCategory` type is unchanged, only `categoryOf` folds.
- A building is hidden until every requirement except money and its count limit is met (stars, population, year, a prerequisite building). The header still shows what the next star wants. Why: the menu overwhelmed Hari.
- Four decor pieces now unlock by population (6, 8, 10, 12) so decor does not all open at once.
- A building placed on a jalan setapak replaces it. Flat pieces (paths, plots, drains) never do, so a path cannot erase a path network by accident.
- Decorations need no road, same as flat pieces.
- The start map lays a loop of free jalan setapak round the kantor.
- Move and Rotate lose the word "free". Each card shows its size in tiles.
