# Kelurahan frame-rate test margin

- The busy-vs-idle Kelurahan check failed on main by 0.1 fps (10.25 against 10.37) after it passed on the PR. Runner load moves that ratio between 0.4 and 0.6.
- The busy run now takes the best of five, and the floor is 0.35 of the idle Kelurahan rate. The 0.5 floor against a packed RT is unchanged, and so is the 80% effects check on the RT map.
- A red main blocks the deploy, so a flaky bar here costs more than a looser one.
