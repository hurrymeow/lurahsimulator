import type { App } from '../app';
import { storage } from '../storage';
import { coachActive } from './coach';
import { picRow, STEPS, stepBody, stepHead } from './howto';

const KEY = 'pakrt.tips';
/** Real time between tips, so two never land back to back. ?debug skips it for tests. */
const GAP_MS = 60_000;
const debug = new URLSearchParams(location.search).has('debug');

interface TipState {
  seen: string[];
  off: boolean;
}

function load(): TipState {
  try {
    const v = JSON.parse(storage.get(KEY) ?? '{}');
    return { seen: Array.isArray(v.seen) ? v.seen : [], off: !!v.off };
  } catch {
    return { seen: [], off: false };
  }
}

let shared: TipState | null = null;

/** New game: every tip is taught again. */
export function resetTips(): void {
  storage.remove(KEY);
  if (shared) Object.assign(shared, { seen: [], off: false });
}

/**
 * Teaches each mechanic the first time it matters. A tip is a tap-to-advance modal,
 * never on a timer, saved as seen the moment it shows, and "Skip tips" turns them all off.
 */
export function setupTips(app: App): void {
  const st = (shared = load());
  const save = () => storage.set(KEY, JSON.stringify(st));
  let lastShown = 0;
  app.refreshers.push((a) => {
    if (st.off || !a.idle || coachActive()) return;
    if (!debug && lastShown && Date.now() - lastShown < GAP_MS) return;
    const next = STEPS.find((s) => !s.basic && s.when && !st.seen.includes(s.id) && s.when(a.s));
    if (!next) return;
    st.seen.push(next.id);
    lastShown = Date.now();
    save();
    a.modal({
      title: stepHead(next),
      body: stepBody(next),
      tone: 'info',
      tip: {
        pics: picRow(next),
        skip: () => {
          st.off = true;
          save();
        },
      },
    });
  });
}
