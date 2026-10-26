import { expect, test, type Page } from '@playwright/test';
import { scanLegibility } from './legibility';

/** The project name ends in -id or -en. See playwright.config.ts. */
const lang = (): 'id' | 'en' => (test.info().project.name.endsWith('-en') ? 'en' : 'id');
const WORDS = { id: { play: 'Main', onOff: /Nyala|Mati/ }, en: { play: 'Play', onOff: /On|Off/ } };

async function start(page: Page): Promise<void> {
  await page.goto(`/?debug&lang=${lang()}`);
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
    if (await page.locator('#modal .card.event').isVisible()) await page.locator('#modal .card.event .btn').first().click();
    else await page.locator('#modal').click();
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
    add('indomaret', 2, 5, 'mangkrak'); add('alfamart', 3, 5, 'permit'); add('selokan', 5, 5, 'building'); add('warung', 6, 7, 'damaged');
    s.ranking.push({ year: 1, us: 90, them: 80, won: true }, { year: 2, us: 100, them: 130, won: false });
    add('parkir', 1, 3);
    for (let i = 0; i < 6; i++) app.s.residents.push({ id: s.nextResidentId++, name: 'Mbak Rizki Putri', job: 'none', pensiun: 0, fake: 0, arrived: 0 });
    app.runTick();
    app.runTick();
  });
  await dismissModals(page);
}

test.describe('tips', () => {
  test('a mechanic is taught once, on tap, and Skip tips silences the rest', async ({ page }) => {
    const RANKED = { id: 'Tiap tahun kamu diperingkat.', en: 'Every year you are ranked.' }[lang()];
    await start(page);
    await page.locator('#howtoGo').click();
    await expect(page.locator('#modal')).toBeHidden();
    // Banjir has fired: its tip waits for a tap, with no timer.
    await page.evaluate(() => {
      const a = (window as unknown as { pakrt: any }).pakrt;
      a.s.lastEvent = { banjir: 0 };
      a.refresh();
    });
    await expect(page.locator('#modal .card h2')).toHaveText({ id: 'Banjir menguji selokanmu.', en: 'Banjir tests your selokan.' }[lang()]);
    await expectLegible(page, 'tip');
    await page.waitForTimeout(1500);
    await expect(page.locator('#modal')).toBeVisible();
    await page.locator('#modal .tap-hint').click();
    await expect(page.locator('#modal')).toBeHidden();
    // Seen once, never again, even after a reload.
    await page.reload();
    await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
    await page.evaluate(() => {
      const a = (window as unknown as { pakrt: any }).pakrt;
      a.s.lastEvent = { banjir: 0 };
      a.s.month = 9;
      a.refresh();
    });
    // One tip at a time: tap through whatever is due, then Skip tips on the next.
    for (let i = 0; i < 6; i++) {
      await expect(page.locator('#modal')).toBeVisible();
      if ((await page.locator('#modal .card h2').textContent()) === RANKED) break;
      await page.locator('#modal .tap-hint').click();
      await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.refresh());
    }
    await expect(page.locator('#modal .card h2')).toHaveText(RANKED);
    await page.locator('#modal .tip-skip').click();
    await expect(page.locator('#modal')).toBeHidden();
    await page.evaluate(() => {
      const a = (window as unknown as { pakrt: any }).pakrt;
      a.s.stats.arrived = 1;
      a.refresh();
    });
    await expect(page.locator('#modal')).toBeHidden();
  });
});

test.describe('how to play', () => {
  test('shows on first launch, is legible, pauses the game, and stays dismissed', async ({ page }) => {
    await start(page);
    await expect(page.locator('#howto')).toBeVisible();
    await expectLegible(page, 'how to play');
    await expect(page.locator('#howto .steps li')).toHaveCount(2);
    await page.locator('#howtoGo').scrollIntoViewIfNeeded();
    await page.locator('#howtoGo').click();
    await expect(page.locator('#howto')).toBeHidden();
    await page.reload();
    await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
    await expect(page.locator('#howto')).toBeHidden();
    await page.locator('#menu-btn').click();
    await page.locator('#act-howto').click();
    await expect(page.locator('#howto')).toBeVisible();
    expect(await page.locator('#howto .steps li').count()).toBeGreaterThan(5);
    const speed = await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.speed);
    expect(speed).toBe(0);
    await page.locator('#howtoGo').click();
    const after = await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.speed);
    expect(after).toBe(1);
  });
});

test.describe('events, ranking, settings', () => {
  for (const id of ['agustusan', 'banjir', 'cabai', 'kecamatan']) {
    for (const broke of [false, true]) {
      test(`event ${id}${broke ? ' while broke' : ''} is legible and has a free choice`, async ({ page }) => {
        await start(page);
        await dismissModals(page);
        await page.evaluate(([eventId, poor]) => {
          const app = (window as unknown as { pakrt: any }).pakrt;
          if (poor) { app.s.res.rupiah = 0; app.s.res.orangDalam = 0; }
          app.s.pendingEvent = eventId;
          app.showEvent();
        }, [id, broke] as const);
        await expect(page.locator('#modal .card.event')).toBeVisible();
        await expectLegible(page, `event ${id}`);
        // The game is paused until a choice is made, and the first choice always works.
        const before = await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.month);
        await page.waitForTimeout(300);
        expect(await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.month)).toBe(before);
        await page.locator('#modal .card.event .btn').first().click();
        // The outcome is a tap-to-dismiss popup with the stat changes.
        await expect(page.locator('#modal .card h2')).toHaveText({ id: 'Hasil kejadian', en: 'Event result' }[lang()]);
        if (id !== 'banjir' && id !== 'kecamatan') await expect(page.locator('#modal .outcome-chip, #modal .outcome-mod').first()).toBeVisible();
        await expectLegible(page, `outcome ${id}`);
        await page.locator('#modal .tap-hint').click();
        await expect(page.locator('#modal')).toBeHidden();
        expect(await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.pendingEvent)).toBeNull();
        await expectLegible(page, `after event ${id}`);
      });
    }
  }

  test('a pending event comes back after a reload', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.s.pendingEvent = 'cabai';
      app.save();
    });
    await page.reload();
    await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
    await expect(page.locator('#modal .card.event')).toBeVisible();
  });

  test('stats sheet shows the ranking history and Indonesia Emas', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await seed(page);
    await page.locator('#hud').click();
    await expect(page.locator('#sheet')).toContainText('Kampung Sebelah');
    await expect(page.locator('#sheet')).toContainText('Indonesia Emas 2045');
    await expectLegible(page, 'stats with ranking');
    await expect(page.locator('#emas-value')).toHaveText(/^\d+\.\d{2}%$/);
  });

  test('every setting flips, saves, and leaves the game readable', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await page.locator('#menu-btn').click();
    await page.locator('#act-settings').click();
    const toggles = page.locator('#sheet .toggle');
    expect(await toggles.count()).toBe(5);
    for (let i = 0; i < 5; i++) {
      const t = toggles.nth(i);
      const before = await t.getAttribute('aria-checked');
      await t.click();
      expect(await t.getAttribute('aria-checked')).not.toBe(before);
      await expect(t).toContainText(WORDS[lang()].onOff);
    }
    await expectLegible(page, 'settings toggled');
    await page.locator('.sheet-head .btn').click();
    await expectLegible(page, 'game with every setting flipped');
    await page.reload();
    await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
    await page.locator('#menu-btn').click();
    await page.locator('#act-settings').click();
    const saved = await page.locator('#sheet .toggle').evaluateAll((els) => els.map((e) => e.getAttribute('aria-checked')));
    expect(saved.length).toBe(5);
  });

  test('volume sliders start audio on first tap and persist', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await page.locator('#menu-btn').click();
    await page.locator('#act-settings').click();
    const music = page.locator('#sheet input.slider').nth(0);
    const sfx = page.locator('#sheet input.slider').nth(1);
    await expect(music).toHaveValue('50');
    await expect(sfx).toHaveValue('100');
    await music.fill('20');
    await sfx.fill('0');
    await expectLegible(page, 'settings with volume sliders');
    await page.reload();
    await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
    await page.locator('#menu-btn').click();
    await page.locator('#act-settings').click();
    await expect(page.locator('#sheet input.slider').nth(0)).toHaveValue('20');
    await expect(page.locator('#sheet input.slider').nth(1)).toHaveValue('0');
  });

  test('defaults to English, switches live to Bahasa Indonesia, and remembers the choice', async ({ page }) => {
    test.skip(lang() !== 'en', 'runs once, with no ?lang override');
    await page.goto('/?debug');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
    await dismissModals(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#place-ok')).toHaveText('Place');
    await page.locator('#menu-btn').click();
    await page.locator('#act-settings').click();
    await page.locator('#sheet [data-lang="id"]').click();
    await expect(page.locator('#sheet .sheet-head h2')).toHaveText('Pengaturan');
    await expect(page.locator('#sheet [data-lang="id"]')).toHaveAttribute('aria-pressed', 'true');
    await expectLegible(page, 'settings after switching to Indonesian');
    await page.locator('.sheet-head .btn').click();
    await expect(page.locator('#place-ok')).toHaveText('Pasang');
    await expect(page.locator('#pause-btn')).toHaveAttribute('aria-label', 'Jeda');
    await page.reload();
    await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
    await expect(page.locator('#place-ok')).toHaveText('Pasang');
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');
  });

  test('large text and high contrast stay legible on busy panels', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await seed(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.settings.largeText = true;
      app.settings.highContrast = true;
      app.applySettings();
    });
    await expectLegible(page, 'large text main');
    await page.locator('#menu-btn').click();
    await expectLegible(page, 'large text menu');
    await page.locator('.sheet-head .btn').click();
    for (const id of ['build', 'warga', 'wacana', 'combo']) {
      await page.locator('#menu-btn').click();
      await page.locator(`#act-${id}`).click();
      await expectLegible(page, `large text ${id}`);
      await page.locator('.sheet-head .btn').click();
    }
  });

  test('with effects off the game still plays and shows numbers', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.settings.effects = false;
      app.applySettings();
    });
    for (let i = 0; i < 12; i++) {
      await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.runTick());
      await dismissModals(page);
      if (await page.locator('#modal .card.event .btn').first().isVisible()) await page.locator('#modal .card.event .btn').first().click();
      await dismissModals(page);
    }
    await expectLegible(page, 'effects off');
    expect(await page.locator('#map.shake').count()).toBe(0);
  });
});

test.describe('slim HUD and one menu', () => {
  test('main screen has only pause, speed and Menu buttons', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    const ids = await page.evaluate(() =>
      [...document.querySelectorAll('button')].filter((b) => b.getClientRects().length && b.id !== 'ticker').map((b) => b.id),
    );
    expect(ids).toEqual(['pause-btn', 'speed-btn', 'menu-btn']);
    const hud = (await page.locator('#hud').boundingBox())!;
    expect(hud.height).toBeLessThanOrEqual(80);
  });

  test('pause toggles and speed cycles 1x, 2x, 4x', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    const speed = () => page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.speed);
    for (const want of [2, 4, 1]) {
      await page.locator('#speed-btn').click();
      expect(await speed()).toBe(want);
      await expect(page.locator('#speed-btn')).toHaveText(`${want}x`);
    }
    await page.locator('#speed-btn').click();
    await page.locator('#pause-btn').click();
    expect(await speed()).toBe(0);
    await expect(page.locator('#pause-btn')).toHaveAttribute('aria-label', WORDS[lang()].play);
    await page.locator('#pause-btn').click();
    expect(await speed()).toBe(2);
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

    await page.locator('#menu-btn').click();
    await expectLegible(page, 'Menu');
    await page.locator('.sheet-head .btn').click();

    const panels = [['build', 'Build'], ['warga', 'Warga'], ['wacana', 'Wacana'], ['combo', 'Buku Combo'], ['log', 'Log'], ['stats', 'Kas & ranking'], ['settings', 'Settings']] as const;
    for (const [id, name] of panels) {
      await page.locator('#menu-btn').click();
      await page.locator(`#act-${id}`).click();
      await expect(page.locator('#sheet')).toBeVisible();
      await expectLegible(page, `${name} panel`);
      await page.locator('.sheet-head .btn').click();
    }

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
      // The map opens centred on the Kantor RT, so the empty tile behind it is always on screen.
      const app = (window as unknown as { pakrt: any }).pakrt;
      const k = app.s.buildings.find((b: any) => b.def === 'kantorRT');
      return app.view.tileCentre(k.x, k.y - 1);
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

  test('tapping a tall building above its tile opens that building', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    const box = (await page.locator('#map').boundingBox())!;
    const at = await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      const k = app.s.buildings.find((b: any) => b.def === 'kantorRT');
      const c = app.view.tileCentre(k.x, k.y);
      // Aim at the roof, which overlaps the tile behind on screen.
      return { x: c.x, y: c.y - app.view.tile * 1.2 };
    });
    await page.mouse.click(box.x + at.x, box.y + at.y);
    await expect(page.locator('.sheet-head')).toContainText('Kantor RT');
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

test.describe('update banner', () => {
  test('Menu button stays on screen and tappable while the banner shows', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await page.evaluate(() => ((document.getElementById('update-banner') as HTMLElement).hidden = false));
    const box = await page.locator('#menu-btn').boundingBox();
    const vh = page.viewportSize()!.height;
    expect(box && box.y >= 0 && box.y + box.height <= vh, `menu at ${JSON.stringify(box)} in ${vh}px`).toBe(true);
    await page.locator('#menu-btn').click();
    await expect(page.locator('.sheet:not([hidden])')).toBeVisible();

  });
});
test.describe('walkers and effects', () => {
  /** Walker positions, rounded so idle bobbing does not count as moving. */
  const spots = (page: Page) =>
    page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.view.crowd.people.map((p: any) => `${p.fx.toFixed(2)},${p.fy.toFixed(2)}`).join(' '));

  test('residents walk the map and ojol riders join them', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await seed(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.s.residents[0].job = 'ojol';
      app.speed = 0;
    });
    await page.waitForTimeout(200);
    const people = await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.view.crowd.people);
    expect(people.length).toBeGreaterThan(4);
    expect(people.some((p: { kind: string }) => p.kind === 'ojol')).toBe(true);
    const before = await spots(page);
    await page.waitForTimeout(4500);
    expect(await spots(page)).not.toBe(before);
    // Nobody stands inside a building.
    const inside = await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      const solid = app.s.buildings.filter((b: any) => !['selokan', 'parkir'].includes(b.def));
      return app.view.crowd.people.filter((p: any) => solid.some((b: any) => b.x === Math.floor(p.fx) && b.y === Math.floor(p.fy))).length;
    });
    expect(inside).toBe(0);
  });

  test('reduce motion keeps walkers still and effects off skips particles', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await seed(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.settings.reduceMotion = true;
      app.applySettings();
      app.speed = 0;
      app.handleFx([{ kind: 'pop', x: 2, y: 3, res: 'rupiah', amount: 900000 }]);
      app.view.pulse();
      app.view.burst(2, 3);
    });
    const before = await spots(page);
    await page.waitForTimeout(1500);
    expect(await spots(page)).toBe(before);
    expect(await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.view.fx.count)).toBe(0);
  });

  test('walkers, particles and night keep the frame rate', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await seed(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.speed = 0;
      for (let i = 0; i < 20; i++) app.s.residents.push({ id: 900 + i, name: 'Mas Joko', job: i % 3 ? 'none' : 'ojol', pensiun: 0, fake: 0, arrived: 0 });
    });
    /** Frames per second over 1.5 s at night, with income every 20 frames. busy turns effects on: coins, dust, pulse, tint. */
    const fps = (busy: boolean) =>
      page.evaluate(
        (busy) =>
          new Promise<number>((done) => {
            const app = (window as unknown as { pakrt: any }).pakrt;
            app.settings.effects = busy;
            app.applySettings();
            app.s.month = 2;
            app.acc = 4800;
            let n = 0;
            const t0 = performance.now();
            const f = (now: number) => {
              n++;
              if (n % 20 === 0) {
                app.handleFx([{ kind: 'pop', x: 2, y: 3, res: 'rupiah', amount: 900000 }, { kind: 'built', uid: app.s.buildings[0].uid }]);
                app.view.pulse();
              }
              if (now - t0 < 1500) requestAnimationFrame(f);
              else done((n * 1000) / (now - t0));
            };
            requestAnimationFrame(f);
          }),
        busy,
      );
    // Best of three runs each, interleaved, so one hiccup on a shared CI machine does not decide it.
    let plain = 0;
    let busy = 0;
    for (let i = 0; i < 3; i++) {
      plain = Math.max(plain, await fps(false));
      busy = Math.max(busy, await fps(true));
    }
    // Compared with the same map with effects off, so a slow CI machine does not fail it.
    expect(busy, `effects off ${plain.toFixed(0)} fps, busy ${busy.toFixed(0)} fps`).toBeGreaterThan(plain * 0.8);
  });
});
