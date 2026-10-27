/** What is stopping game time, if anything. A manual pause is the player's own and is kept separate. */
export type PauseInputs = {
  speed: number;
  held: boolean;
  sheetOpen: boolean;
  modals: number;
  pendingEvent: boolean;
  placing: boolean;
  howtoOpen: boolean;
};

/** True when a menu, panel, card, popup or build mode is holding time. */
export const autoPaused = (p: PauseInputs): boolean => p.held || p.sheetOpen || p.modals > 0 || p.pendingEvent || p.placing || p.howtoOpen;

/** The sim ticks only when the player has not paused and nothing is holding time. Closing the last holder resumes at the same speed. */
export const simRunning = (p: PauseInputs): boolean => p.speed > 0 && !autoPaused(p);

/** The Paused pill shows only while the map is in view. A sheet, card or popup already dims the map, so the pill would float over it. */
export const showPausedBadge = (p: PauseInputs): boolean => !p.held && autoPaused(p) && !(p.sheetOpen || p.modals > 0 || p.pendingEvent || p.howtoOpen);
