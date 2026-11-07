// Runs the scorecard T2 specs (tests/e2e/scorecard-t2.spec.ts) at 412px, once in Indonesian and once in English,
// and writes one Playwright JSON report per language to scorecard/.cache/t2-<lang>.json. The scorecard report
// (tests/scorecard/report.test.ts) reads them for rows 3, 6 and 27. A failing spec is a Fail verdict, not a
// script error, so this exits 0 when the reports were written. Usage: node scripts/scorecard-t2.mjs
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';

const CACHE = 'scorecard/.cache';
mkdirSync(CACHE, { recursive: true });
let missing = 0;
for (const lang of ['id', 'en']) {
  const out = `${CACHE}/t2-${lang}.json`;
  rmSync(out, { force: true });
  // CI builds only one language's projects, picked by E2E_LANG (playwright.config.ts). Local runs build both.
  const res = spawnSync('npx', ['playwright', 'test', 'tests/e2e/scorecard-t2.spec.ts', `--project=phone-412-${lang}`, '--reporter=list,json'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, E2E_LANG: lang, PLAYWRIGHT_JSON_OUTPUT_FILE: out },
  });
  if (!existsSync(out)) {
    console.error(`scorecard-t2: no report for ${lang} (exit ${res.status}).`);
    missing++;
  }
}
process.exit(missing ? 1 : 0);
