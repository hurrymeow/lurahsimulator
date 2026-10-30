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
  timeout: 60_000,
  // Ends a hung run with a report before the 10 min job cap kills it. Local runs have no cap.
  globalTimeout: process.env.CI ? 8 * 60_000 : 0,
  retries: process.env.CI ? 1 : 0,
  // Per-test sharding. Without it Playwright shards whole spec files, so whole spec files would split unevenly across shards.
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
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
  projects: PHONES.flatMap((p) =>
    (process.env.CI ? (process.env.E2E_LANG === 'en' ? (['en'] as const) : (['id'] as const)) : (['id', 'en'] as const)).map((lang) => ({
      name: `${p.name}-${lang}`,
      use: { viewport: p.viewport, deviceScaleFactor: 2, hasTouch: true, isMobile: true, locale: lang === 'id' ? 'id-ID' : 'en-US' },
    })),
  ),
});
