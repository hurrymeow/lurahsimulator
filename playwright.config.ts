import { defineConfig } from '@playwright/test';

const PHONES = [
  { name: 'phone-360', viewport: { width: 360, height: 640 } },
  { name: 'phone-320', viewport: { width: 320, height: 568 } },
  // Big phones at installed-app (standalone) heights: no browser bar, so taller than a browser tab.
  { name: 'phone-412', viewport: { width: 412, height: 915 } },
  { name: 'phone-430', viewport: { width: 430, height: 932 } },
];

export default defineConfig({
  testDir: 'tests/e2e',
  // The screen-only bot is Nightly only (SCREEN_BOT=1, projects screenbot-*). Every other run leaves it out.
  testIgnore: process.env.SCREEN_BOT ? undefined : /screen-bot\.spec/,
  timeout: 60_000,
  // Ends a hung run with a report before the 10 min job cap kills it. Local runs have no cap.
  globalTimeout: process.env.CI && !process.env.SCREEN_BOT ? 8 * 60_000 : 0,
  retries: process.env.CI ? 1 : 0,
  // Per-test sharding. Without it Playwright shards whole spec files, so whole spec files would split unevenly across shards.
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  // The JSON report feeds the job summary's list of failed and flaky tests (scripts/flaky-summary.mjs).
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'reports/results.json' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    serviceWorkers: 'block',
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  // CI runs every phone in Indonesian, the default language and the one whose longer strings clip first.
  // The scheduled English workflow sets E2E_LANG=en. Local runs add English. The spec reads the language from the project name suffix.
  // E2E_BROWSER=webkit (the nightly WebKit workflow) runs the same phones in WebKit, named webkit-phone-<width>-<lang>.
  projects: process.env.SCREEN_BOT
    ? [
        // 412 in English and 360 in Indonesian: the widths and languages the bot plays (docs/plans/first-2h-playtest.md, T2).
        { name: 'screenbot-412-en', testMatch: /screen-bot\.spec/, use: { actionTimeout: 8000, viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, locale: 'en-US' } },
        { name: 'screenbot-360-id', testMatch: /screen-bot\.spec/, use: { actionTimeout: 8000, viewport: { width: 360, height: 640 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, locale: 'id-ID' } },
      ]
    : PHONES.flatMap((p) =>
    (process.env.CI ? (process.env.E2E_LANG === 'en' ? (['en'] as const) : (['id'] as const)) : (['id', 'en'] as const)).map((lang) => ({
      name: `${process.env.E2E_BROWSER === 'webkit' ? 'webkit-' : ''}${p.name}-${lang}`,
      use: {
        ...(process.env.E2E_BROWSER === 'webkit' ? { browserName: 'webkit' as const } : {}),
        viewport: p.viewport, deviceScaleFactor: 2, hasTouch: true, isMobile: true, locale: lang === 'id' ? 'id-ID' : 'en-US',
      },
    })),
  ),
});
