import { expect, test, type Page } from '@playwright/test';
import { scanLegibility } from './legibility';

async function start(page: Page): Promise<void> {
  await page.goto('/?debug');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
  await page.evaluate(() => document.fonts.ready);
}

/** Taps through every queued message. */
async function dismissModals(page: Page): Promise<void> {
  if (await page.locator('#howto').isVisible()) await page.locator('#howtoGo').click();
  for (let i = 0; i < 12; i++) {
    if (!(await page.locator('#modal').isVisible())) return;
    await page.locator('#modal').click();
    await page.waitForTimeout(60);
  }
}

async function expectLegible(page: Page, where: string): Promise<void> {
  const problems = await scanLegibility(page);
  expect(problems, `${where}\n${problems.map((p) => `${p.rule}: "${p.text}" (${p.detail})`).join('\n')}`).toEqual([]);
}

/** Fills the kampung with content so every panel has real text in it. */
async function seed(page: Page): Promise<void> {
  await page.evaluate(() => {
    const app = (window as unknown as { pakrt: any }).pakrt;
    const s = app.s;
    s.res.rupiah = 1_234_567_890;
    s.month = 14;
    const add = (def: string, x: number, y: number, status = 'active', level = 1) =>
      s.buildings.push({ uid: s.nextUid++, def, x, y, level, status, timer: 2, invested: 3_000_000, placedAt: 0 });
    add('warung', 2, 3); add('posRonda', 3, 3); add('wifi', 4, 3);
    add('indomaret', 2, 5, 'mangkrak'); add('alfamart', 3, 5, 'permit'); add('selokan', 5, 5, 'building');
    add('parkir', 1, 3);
    for (let i = 0; i < 6; i++) app.s.residents.push({ id: s.nextResidentId++, name: 'Mbak Rizki Putri', job: 'none', pensiun: 0, fake: 0, arrived: 0 });
    app.runTick();
    app.runTick();
  });
  await dismissModals(page);
}

test.describe('how to play', () => {
  test('shows on first launch, is legible, pauses the game, and stays dismissed', async ({ page }) => {
    await start(page);
    await expect(page.locator('#howto')).toBeVisible();
    await expectLegible(page, 'how to play');
    await expect(page.locator('#howto .steps li').first()).toBeVisible();
    await page.locator('#howtoGo').scrollIntoViewIfNeeded();
    await page.locator('#howtoGo').click();
    await expect(page.locator('#howto')).toBeHidden();
    await page.reload();
    await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
    await expect(page.locator('#howto')).toBeHidden();
    await page.locator('#help-btn').click();
    await expect(page.locator('#howto')).toBeVisible();
    const speed = await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.speed);
    expect(speed).toBe(0);
    await page.locator('#howtoGo').click();
    const after = await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.speed);
    expect(after).toBe(1);
  });
});

test.describe('text is legible and never cut off', () => {
  test('first screen and welcome message', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await expectLegible(page, 'welcome');
    await dismissModals(page);
    await expectLegible(page, 'main screen');
  });

  test('every panel on a busy kampung', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await seed(page);
    await expectLegible(page, 'busy main screen');

    for (const [id, name] of [['build', 'Build'], ['warga', 'Warga'], ['wacana', 'Wacana'], ['combo', 'Buku Combo']] as const) {
      await page.locator(`#act-${id}`).click();
      await expect(page.locator('#sheet')).toBeVisible();
      await expectLegible(page, `${name} panel`);
      await page.locator('.sheet-head .btn').click();
    }

    await page.locator('#settings-btn').click();
    await expectLegible(page, 'Settings panel');
    await page.locator('.sheet-head .btn').click();

    await page.locator('#hud').click();
    await expectLegible(page, 'Stats panel');
    await page.locator('.sheet-head .btn').click();

    await page.locator('#ticker').click();
    await expectLegible(page, 'Log panel');
    await page.locator('.sheet-head .btn').click();
  });

  test('building inspector for every status', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await seed(page);
    const uids = await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.buildings.map((b: any) => b.uid));
    for (const uid of uids) {
      await page.evaluate((u) => (window as unknown as { pakrt: any }).pakrt.inspect(u), uid);
      await expectLegible(page, `inspector uid ${uid}`);
      await page.locator('.sheet-head .btn').click();
    }
  });

  test('placement bar with a blocked tile shows what is missing', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.startPlacing('wifi'));
    const box = (await page.locator('#map').boundingBox())!;
    const at = await page.evaluate(() => {
      const v = (window as unknown as { pakrt: any }).pakrt.view;
      return v.tileCentre(0, 0);
    });
    await page.mouse.click(box.x + at.x, box.y + at.y);
    await expect(page.locator('#place-info .missing li').first()).toBeVisible();
    await expectLegible(page, 'placement with missing requirements');
  });

  test('map tiles stay big enough to tap', async ({ page }) => {
    await start(page);
    const tile = await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.view.tile);
    expect(tile).toBeGreaterThanOrEqual(32);
  });

  test('a combo fanfare message', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      const s = app.s;
      for (const [d, x] of [['warung', 0], ['posRonda', 1], ['wifi', 2]] as const)
        s.buildings.push({ uid: s.nextUid++, def: d, x, y: 0, level: 1, status: 'active', timer: 0, invested: 0, placedAt: 0 });
      app.runTick();
    });
    await expect(page.locator('#modal .fanfare')).toBeVisible();
    await expectLegible(page, 'combo fanfare');
  });

  test('a long idle run never breaks the layout', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    for (let i = 0; i < 40; i++) {
      await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.runTick());
      await dismissModals(page);
      if (i % 10 === 9) await expectLegible(page, `after ${i + 1} idle months`);
    }
  });
});
