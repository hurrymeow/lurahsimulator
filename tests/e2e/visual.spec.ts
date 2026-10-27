import { expect, test, type Page } from '@playwright/test';

/**
 * Screenshot baselines for five key screens, at one phone width in both languages.
 * The clock is frozen, so the new game gets the same seed every run, and motion is off, so a diff means the screen changed.
 * Baselines are drawn in CI's Playwright image. Refresh them only for an intended visual change: see UI.md.
 */
test.skip(({ viewport }) => viewport?.width !== 412, 'Baselines are kept at 412px only.');

const lang = (): 'id' | 'en' => (test.info().project.name.endsWith('-en') ? 'en' : 'id');
const SHOT = { maxDiffPixelRatio: 0.002, animations: 'disabled', caret: 'hide' } as const;

/** Lets timers, animation frames and fades run a fixed amount of fake time. */
const settle = (page: Page, ms = 800) => page.clock.runFor(ms);

async function open(page: Page): Promise<void> {
  await page.clock.install({ time: new Date('2026-01-01T09:00:00Z') });
  await page.goto(`/?debug&lang=${lang()}`);
  await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

/** Starts a new game from the fixed seed with the first-launch tutorial out of the way. */
async function play(page: Page): Promise<void> {
  await page.locator('#home-start').click();
  await page.locator('#home-new').click();
  await page.evaluate(() => {
    const app = (window as unknown as { pakrt: any }).pakrt;
    app.speed = 0;
    app.settings.reduceMotion = true;
    app.applySettings();
  });
  await settle(page);
  for (let i = 0; i < 10 && (await page.locator('#howto, #modal').first().isVisible()); i++) {
    if (await page.locator('#howtoGo').isVisible()) await page.locator('#howtoGo').click();
    else await page.locator('#modal').click();
    await settle(page, 300);
  }
}

test.describe('visual baselines', () => {
  test('home', async ({ page }) => {
    await open(page);
    await settle(page);
    // The map behind home still drifts (clouds, walkers), so it is hidden here. The fill and edge checks cover it.
    await page.addStyleTag({ content: '#map { visibility: hidden; }' });
    await expect(page).toHaveScreenshot(`home-${lang()}.png`, SHOT);
  });

  test('HUD at start', async ({ page }) => {
    await open(page);
    await play(page);
    await expect(page).toHaveScreenshot(`hud-${lang()}.png`, SHOT);
  });

  test('Build sheet', async ({ page }) => {
    await open(page);
    await play(page);
    // Build has its own button in the bottom dock.
    await page.locator('#dock-build').click();
    await settle(page);
    await expect(page).toHaveScreenshot(`build-${lang()}.png`, SHOT);
  });

  test('event popup', async ({ page }) => {
    await open(page);
    await play(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.s.pendingEvent = 'agustusan';
      app.showEvent();
    });
    await settle(page);
    await expect(page).toHaveScreenshot(`event-${lang()}.png`, SHOT);
  });

  test('tip card', async ({ page }) => {
    await open(page);
    await play(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.modal({ title: 'Tip', body: 'A tip card keeps its look.', tone: 'info', tip: { pics: null } });
    });
    await settle(page);
    await expect(page).toHaveScreenshot(`tip-${lang()}.png`, SHOT);
  });
});
