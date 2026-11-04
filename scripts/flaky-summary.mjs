// Prints a Markdown summary of a Playwright JSON report: the tests that failed, and the tests that passed only on
// retry (flaky). CI appends it to the job summary, so a flaky test leaves a record even when the run is green.
// Usage: node scripts/flaky-summary.mjs <results.json> [label]
import { existsSync, readFileSync } from 'node:fs';

const [file, label = 'e2e'] = process.argv.slice(2);
if (!file || !existsSync(file)) {
  console.log(`### ${label}\n\nNo JSON report (the run stopped before Playwright wrote one).`);
  process.exit(0);
}
const report = JSON.parse(readFileSync(file, 'utf8'));
const flaky = [];
const failed = [];
const walk = (suite, path) => {
  for (const s of suite.suites ?? []) walk(s, [...path, s.title].filter(Boolean));
  for (const spec of suite.specs ?? [])
    for (const test of spec.tests ?? []) {
      const name = `${[...path, spec.title].join(' › ')} [${test.projectName}]`;
      if (test.status === 'flaky') flaky.push(name);
      else if (test.status === 'unexpected') failed.push(name);
    }
};
walk(report, []);
const s = report.stats ?? {};
const lines = [`### ${label}`, '', `Passed ${s.expected ?? 0}, flaky ${s.flaky ?? flaky.length}, failed ${s.unexpected ?? failed.length}, skipped ${s.skipped ?? 0}.`];
if (failed.length) lines.push('', '**Failed**', ...failed.map((n) => `- ${n}`));
if (flaky.length) lines.push('', '**Flaky** (passed on retry; fix the cause, see TESTING.md)', ...flaky.map((n) => `- ${n}`));
console.log(lines.join('\n'));
