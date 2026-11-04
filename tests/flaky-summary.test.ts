import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// TESTING.md item 2: a test that passes on retry must leave a record. CI prints this summary on every run.
describe('flaky test summary', () => {
  it('lists failed and flaky tests from a Playwright JSON report', () => {
    const dir = mkdtempSync(join(tmpdir(), 'flaky-'));
    const file = join(dir, 'results.json');
    writeFileSync(file, JSON.stringify({
      stats: { expected: 1, flaky: 1, unexpected: 1, skipped: 0 },
      suites: [{ title: 'ui.spec.ts', suites: [{ title: 'goal', specs: [
        { title: 'shows one goal', tests: [{ projectName: 'phone-320-id', status: 'flaky' }] },
        { title: 'opens a list', tests: [{ projectName: 'phone-412-id', status: 'unexpected' }] },
        { title: 'closes', tests: [{ projectName: 'phone-412-id', status: 'expected' }] },
      ] }] }],
    }));
    const out = execFileSync('node', ['scripts/flaky-summary.mjs', file, 'Shard 2'], { encoding: 'utf8' });
    expect(out).toContain('### Shard 2');
    expect(out).toContain('Passed 1, flaky 1, failed 1, skipped 0.');
    expect(out).toContain('- ui.spec.ts › goal › shows one goal [phone-320-id]');
    expect(out).toMatch(/\*\*Failed\*\*\n- ui\.spec\.ts › goal › opens a list \[phone-412-id\]/);
    expect(out).not.toContain('closes');
  });
});
