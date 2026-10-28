/** A system popup must wait for a quiet moment, so it never steals a tap. */
export const POPUP_IDLE_MS = 500;

export interface PopupQueueState {
  modalHidden: boolean;
  sheetOpen: boolean;
  placing: boolean;
  homeOpen: boolean;
  howtoOpen: boolean;
}

/**
 * True only when no card is showing, nothing else is open, the player is
 * not placing, and 500ms have passed since their last pointer or key input.
 * User-initiated cards (a resource explainer, an event outcome) do not use
 * this gate: they are the direct answer to the tap that just happened.
 */
export function canShowQueued(now: number, lastInputAt: number, s: PopupQueueState): boolean {
  return (
    s.modalHidden &&
    !s.sheetOpen &&
    !s.placing &&
    !s.homeOpen &&
    !s.howtoOpen &&
    now - lastInputAt >= POPUP_IDLE_MS
  );
}
