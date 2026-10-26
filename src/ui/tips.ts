import type { App } from '../app';
import { storage } from '../storage';
import { picRow, STEPS, stepBody, stepHead } from './howto';

const KEY = 'pakrt.tips';

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

/**
 * Teaches each mechanic the first time it matters. A tip is a tap-to-advance modal,
 * never on a timer, saved as seen the moment it shows, and "Skip tips" turns them all off.
 */
export function setupTips(app: App): void {
  const st = load();
  const save = () => storage.set(KEY, JSON.stringify(st));
  app.refreshers.push((a) => {
    if (st.off || !a.idle) return;
    const next = STEPS.find((s) => !s.basic && s.when && !st.seen.includes(s.id) && s.when(a.s));
    if (!next) return;
    st.seen.push(next.id);
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
