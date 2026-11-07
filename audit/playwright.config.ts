import { defineConfig } from '@playwright/test';

/**
 * The periodic UI audit (UI.md "How each rule is checked", TODO T11). Not part of `npm run e2e` or CI on PRs:
 * run it with `npm run audit:ui`. Every phone width, both languages and both themes. Results go to audit/out/.
 */
const PHONES = [320, 360, 412, 430].map((w) => ({ w, h: w <= 320 ? 568 : w <= 360 ? 640 : 915 }));
export default defineConfig({
  testDir: '.',
  testMatch: 'ui-audit.spec.ts',
  timeout: 600_000,
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4173', serviceWorkers: 'block' },
  webServer: { command: 'npm run build && npm run preview -- --port 4173 --strictPort', url: 'http://localhost:4173', reuseExistingServer: true, timeout: 120_000 },
  projects: PHONES.flatMap((p) => (['id', 'en'] as const).flatMap((lang) => (['light', 'dark'] as const).map((theme) => ({
    name: `${p.w}-${lang}-${theme}`,
    use: { viewport: { width: p.w, height: p.h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, locale: lang === 'id' ? 'id-ID' : 'en-US' },
  })))),
});
