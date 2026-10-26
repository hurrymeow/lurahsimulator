# Auto-pause

- Time is held by a pure rule in `src/ui/autopause.ts`. Menu, panel, popup, event card, how-to, home screen and build mode all hold it.
- The player's speed is never touched. Closing the last holder resumes at the same speed. A manual pause stays paused.
- A "Paused" pill shows on the map while auto-paused. Walkers and ambient animation keep running.
