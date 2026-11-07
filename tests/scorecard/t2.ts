// Scorecard rows 3, 6 and 27 are judged by Playwright specs on the real app (tests/e2e/scorecard-t2.spec.ts).
// `npm run scorecard:t2` runs them at 412px in Indonesian and English and writes one Playwright JSON report per
// language to the scorecard cache. This file reads those reports. `npm test` never runs the specs.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import type { Verdict } from './scorecard';

export type T2Lang = 'id' | 'en';
/** One spec run: its row, its language, and Playwright's outcome (expected, unexpected, flaky or skipped). */
export interface T2Result {
  row: number;
  lang: T2Lang;
  status: string;
  error?: string;
  /** Facts a spec records for the harness to judge (test annotations), such as `progress-on-screen`. */
  notes?: Record<string, string>;
}

/** The languages a row must pass in. Row 27's bar says "in both languages"; rows 3 and 6 need one run. */
const NEEDS_BOTH = new Set([27]);
export const T2_FILE = (lang: T2Lang) => `t2-${lang}.json`;
export const T2_HOW = 'Run `npm run scorecard:t2` (nightly job scorecard-t2) to judge it.';

const plain = (s: string) => s.replace(/\u001b\[[0-9;]*m/g, '').split('\n').map((l) => l.trim()).find(Boolean) ?? '';

interface PwSuite { suites?: PwSuite[]; specs?: { title: string; tests?: { projectName: string; status: string; annotations?: { type: string; description?: string }[]; results?: { error?: { message?: string }; annotations?: { type: string; description?: string }[] }[] }[] }[] }

/** The T2 results in one Playwright JSON report. The language is the project name's suffix (playwright.config.ts). */
export function parseT2Report(report: PwSuite): T2Result[] {
  const out: T2Result[] = [];
  const walk = (s: PwSuite) => {
    for (const c of s.suites ?? []) walk(c);
    for (const spec of s.specs ?? []) {
      const row = /^row (\d+):/.exec(spec.title)?.[1];
      if (!row) continue;
      for (const t of spec.tests ?? []) {
        const lang = t.projectName.endsWith('-en') ? 'en' : 'id';
        const msg = t.results?.map((r) => r.error?.message).find(Boolean);
        const ann = [...(t.annotations ?? []), ...(t.results?.at(-1)?.annotations ?? [])];
        const notes = Object.fromEntries(ann.map((a) => [a.type, a.description ?? '']));
        out.push({ row: Number(row), lang, status: t.status, ...(msg ? { error: plain(msg) } : {}), ...(ann.length ? { notes } : {}) });
      }
    }
  };
  walk(report);
  return out;
}

/** Every T2 report in the cache. An absent or unreadable report gives no results, so its rows read Unknown. */
export function readT2(dir: string): T2Result[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /^t2-(id|en)\.json$/.test(f))
    .flatMap((f) => {
      try {
        return parseT2Report(JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
      } catch {
        return [];
      }
    });
}

/**
 * One row's verdict from its spec runs. Fail when any run failed or passed only on retry (TESTING.md: flaky is a bug).
 * Unknown when there is no run, a run was skipped, or a needed language is missing. Pass only when every needed
 * language ran and passed first time.
 */
export function t2Verdict(row: number, results: T2Result[], what: string): { verdict: Verdict; evidence: string } {
  const mine = results.filter((r) => r.row === row);
  const langs = [...new Set(mine.map((r) => r.lang))].sort();
  const bad = mine.filter((r) => r.status === 'unexpected' || r.status === 'flaky');
  if (bad.length) {
    const b = bad[0];
    return { verdict: 'Fail', evidence: `${what} Spec ${b.status === 'flaky' ? 'passed only on retry' : 'failed'} in ${b.lang}${b.error ? `: ${b.error.slice(0, 160)}` : ''}.` };
  }
  if (!mine.length) return { verdict: 'Unknown', evidence: `${what} No T2 report in the scorecard cache. ${T2_HOW}` };
  if (mine.some((r) => r.status !== 'expected')) return { verdict: 'Unknown', evidence: `${what} Spec was skipped. ${T2_HOW}` };
  const need: T2Lang[] = NEEDS_BOTH.has(row) ? ['en', 'id'] : [];
  const missing = need.filter((l) => !langs.includes(l));
  if (missing.length) return { verdict: 'Unknown', evidence: `${what} Passed in ${langs.join(' and ')}; no ${missing.join(' or ')} run. ${T2_HOW}` };
  return { verdict: 'Pass', evidence: `${what} Spec passed in ${langs.join(' and ')} at 412px.` };
}
