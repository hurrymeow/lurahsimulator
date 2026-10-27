import { defineConfig } from '@playwright/test';

const PHONES = [
  { name: 'phone-360', viewport: { width: 360, height: 640 } },
  { name: 'phone-390', viewport: { width: 390, height: 844 } },
  { name: 'phone-320', viewport: { width: 320, height: 568 } },
];

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  // Per-test sharding. Without it Playwright shards whole spec files, so 6 projects split 2/2/1/1 across 4 shards.
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
  // Every phone runs in both languages. Indonesian strings run longer, so it is the one most likely to clip.
  // The spec reads the language from the project name suffix.
  projects: PHONES.flatMap((p) =>
    (['id', 'en'] as const).map((lang) => ({
      name: `${p.name}-${lang}`,
      use: { viewport: p.viewport, deviceScaleFactor: 2, hasTouch: true, isMobile: true, locale: lang === 'id' ? 'id-ID' : 'en-US' },
    })),
  ),
});
