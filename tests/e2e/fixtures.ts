import { expect, test as base } from '@playwright/test';
import { appendFileSync } from 'node:fs';

/**
 * Every spec uses this `test`: a page error or a console.error fails the test that caused it (TESTING.md items 5
 * and 15), unless it matches the reasoned allowlist below.
 */
export const CONSOLE_ALLOW: { pattern: RegExp; why: string }[] = [];

export const test = base.extend<{ consoleGuard: void }>({
  consoleGuard: [
    async ({ page }, use, info) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
      });
      await use();
      const bad = errors.filter((e) => !CONSOLE_ALLOW.some((a) => a.pattern.test(e)));
      if (process.env.CONSOLE_LOG) for (const e of bad) appendFileSync(process.env.CONSOLE_LOG, `${info.title} [${info.project.name}] ${e}\n`);
      else expect(bad, 'page errors and console.error calls').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
