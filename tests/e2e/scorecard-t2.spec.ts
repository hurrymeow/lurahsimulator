import { type Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { scanLegibility } from './legibility';
import { setLang, t } from '../../src/i18n';

/** The project name ends in -id or -en. See playwright.config.ts. */
const lang = (): 'id' | 'en' => (test.info().project.name.endsWith('-en') ? 'en' : 'id');

async function start(page: Page): Promise<void> {
  await page.goto(`/?debug&lang=${lang()}`);
  await passHome(page);
  await page.evaluate(() => document.fonts.ready);
}

/** Taps Start on the home screen, then Continue if there is a save, otherwise New game. */
async function passHome(page: Page): Promise<void> {
  await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
  await page.locator('#home-start').click();
  const cont = page.locator('#home-continue');
  if (await cont.isVisible()) await cont.click();
  else {
    await page.locator('#home-new').click();
    await page.locator('#home-begin').click();
  }
  await expect(page.locator('#home')).toHaveCount(0);
}

/** The first-launch guide covers the map until Got it. */
async function passHowto(page: Page): Promise<void> {
  if (await page.locator('#howtoGo').isVisible()) await page.locator('#howtoGo').click();
}

test('row 27: coming back', async ({ page }, testInfo) => {
  await start(page);
  await passHowto(page);
  const before = await page.evaluate(() => {
    const app = (window as unknown as { pakrt: any }).pakrt;
    // Place one house through the app's own placement path, then save as the player's leave does.
    app.startPlacing('rumah');
    const spot = app.bestSpot();
    if (!spot) throw new Error('no free tile for the house');
    app.moveGhost(spot);
    app.confirmPlace();
    app.save();
    return { buildings: app.s.buildings.length, residents: app.s.residents.length };
  });
  expect(before.buildings).toBeGreaterThan(0);

  await page.reload();
  await passHome(page);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(5000);
  const after = await page.evaluate(() => {
    const app = (window as unknown as { pakrt: any }).pakrt;
    return { buildings: app.s.buildings.length, residents: app.s.residents.length };
  });
  expect(after).toEqual(before);

  const problems = await scanLegibility(page);
  expect(problems, problems.map((p) => `${p.rule}: "${p.text}" (${p.detail})`).join('\n')).toEqual([]);
  await testInfo.attach('row-27-after-reload.png', { body: await page.screenshot(), contentType: 'image/png' });
});

test('row 6: a Popularitas fall names its cause', async ({ page }) => {
  setLang(lang());
  await start(page);
  await passHowto(page);
  const log = await page.evaluate(() => {
    const app = (window as unknown as { pakrt: any }).pakrt;
    const s = app.s;
    // The first warning waits for the opening weeks, and the monthly regen stays out while Popularitas is high.
    s.month = 6;
    s.res.sabar = 50;
    s.warned = [];
    // A permit waiting in the queue drains Popularitas each month. This is the first drop's cause.
    s.buildings.push({ uid: s.nextUid++, def: 'warung', x: 1, y: 1, level: 1, status: 'permit', timer: 3, invested: 0, placedAt: s.month });
    app.runTick();
    return app.log.map((n: { title: string; body: string }) => ({ title: n.title, body: n.body }));
  });
  const title = t('warn.sabarTitle');
  const body = t('warn.sabar.queue');
  expect(log[0]).toEqual({ title, body });
  await expect(page.locator('#ticker')).toContainText(title);
  await expect(page.locator('#ticker')).toContainText(body);
});

test('row 3: the map grows with each star', async ({ page }) => {
  await start(page);
  await passHowto(page);
  // Developer seed: Menu > Settings > RT 3★, two taps (the first arms, the second loads).
  await page.locator('#menu-btn').click();
  await page.locator('#act-settings').click();
  const seedBtn = page.locator('#sheet [data-seed="rt3"]');
  await seedBtn.scrollIntoViewIfNeeded();
  await seedBtn.click();
  await expect(seedBtn).toHaveClass(/btn-danger/);
  await seedBtn.click();
  await expect(page.locator('#sheet')).toBeHidden();

  const counts = await page.evaluate(() => {
    const app = (window as unknown as { pakrt: any }).pakrt;
    const defs = (window as unknown as { pakrtDefs: () => { id: string; requires?: { stars?: { stage: string; n: number } } }[] }).pakrtDefs();
    const byId = new Map(defs.map((d) => [d.id, d] as const));
    // The star that unlocks a building kind. Kinds with no RT star gate are always buildable.
    const need = (id: string): number => {
      const stars = byId.get(id)?.requires?.stars;
      return stars && stars.stage === 'rt' ? stars.n : 0;
    };
    // The seed is the RT at 3★. At 1★ and 2★ the same kampung could not have the kinds later stars unlock.
    const full = app.s.buildings.map((b: any) => ({ ...b }));
    const at = (stars: number): number => {
      app.s.stage.stars.rt = stars;
      // src/render/map.ts draws every player building plus every neighbour's: count that same list.
      app.s.buildings = full.filter((b: any) => need(b.def) <= stars);
      app.refresh();
      const neighbours = (app.s.neighbours ?? []).reduce((n: number, x: any) => n + x.buildings.length, 0);
      return app.s.buildings.length + neighbours;
    };
    return { one: at(1), two: at(2), three: at(3) };
  });
  expect(counts.two).toBeGreaterThan(counts.one);
  expect(counts.three).toBeGreaterThan(counts.two);
});
