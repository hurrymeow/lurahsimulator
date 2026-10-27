import { expect, test, type Page } from '@playwright/test';
import { scanLegibility } from './legibility';

/** The project name ends in -id or -en. See playwright.config.ts. */
const lang = (): 'id' | 'en' => (test.info().project.name.endsWith('-en') ? 'en' : 'id');
const WORDS = { id: { play: 'Main', paused: 'Jeda', close: 'Tutup', onOff: /Nyala|Mati/ }, en: { play: 'Play', paused: 'Paused', close: 'Close', onOff: /On|Off/ } };

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
  else await page.locator('#home-new').click();
  await expect(page.locator('#home')).toHaveCount(0);
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

/**
 * Switches tips off through the product's own Skip tips button, before any are seen.
 * A test that is not about tips needs this: a tip can land on the month before a message
 * under test and be shown first, queueing that message behind it.
 */
async function skipTips(page: Page): Promise<void> {
  await page.evaluate(() => {
    const app = (window as unknown as { pakrt: any }).pakrt;
    // An arrival is the Sabar tip's trigger, and the one this fresh game can hit for certain.
    app.s.stats.arrived = 1;
    app.refresh();
  });
  await page.locator('#modal .tip-skip').click();
  await expect(page.locator('#modal')).toBeHidden();
}

/** Runs one month, clearing a random event if it pauses the clock on the way. */
async function runMonth(page: Page): Promise<void> {
  await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.runTick());
  const event = page.locator('#modal .card.event');
  if (!(await event.isVisible())) return;
  // The first choice is always free, so an event can never soft-lock the test.
  await event.locator('.btn').first().click();
  await page.locator('#modal .tap-hint').click();
}

/** The open pop-up card sits mid-screen with centred text, the same for an event as for its result. */
async function expectCentred(page: Page, where: string): Promise<void> {
  const m = await page.evaluate(() => {
    const card = document.querySelector('#modal .card') as HTMLElement;
    const r = card.getBoundingClientRect();
    return { off: Math.abs(r.top + r.height / 2 - innerHeight / 2), full: r.height >= innerHeight * 0.85, align: getComputedStyle(card.querySelector('p')!).textAlign };
  });
  expect(m.align, `${where} text alignment`).toBe('center');
  if (!m.full) expect(m.off, `${where} is vertically centred`).toBeLessThan(3);
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
    add('indomaret', 2, 5, 'mangkrak'); add('alfamart', 3, 5, 'permit'); add('biopori', 5, 5, 'building'); add('warung', 6, 7, 'damaged');
    s.ranking.push({ year: 1, us: 90, them: 80, won: true }, { year: 2, us: 100, them: 130, won: false });
    add('parkir', 1, 3);
    for (let i = 0; i < 6; i++) app.s.residents.push({ id: s.nextResidentId++, name: 'Mbak Rizki Putri', job: 'none', pensiun: 0, fake: 0, arrived: 0 });
    app.runTick();
    app.runTick();
  });
  await dismissModals(page);
}

test.describe('opener', () => {
  test('a new game walks the first Rumah, shows the goal, and Skip ends it', async ({ page }) => {
    await page.goto(`/?debug&coach&lang=${lang()}`);
    await passHome(page);
    await page.evaluate(() => document.fonts.ready);
    // A new game opens straight on the welcome note, with no How to play card first.
    await expect(page.locator('#howto')).toBeHidden();
    // The goal sits under the Emas bar from the first frame.
    await expect(page.locator('#goal')).toBeVisible();
    await expect(page.locator('#goal')).toContainText(/\d/);
    await expect(page.locator('#coach')).toBeVisible();
    await expect(page.locator('#menu-btn')).toHaveClass(/coach-pulse/);
    // The note sits right above the bottom bar, next to the Menu button it points at.
    const note = (await page.locator('#coach').boundingBox())!;
    const menuBox = (await page.locator('#menu-btn').boundingBox())!;
    expect(menuBox.y - (note.y + note.height)).toBeLessThan(40);
    expect(menuBox.y - (note.y + note.height)).toBeGreaterThanOrEqual(0);
    await expectLegible(page, 'opener, Menu step');
    await page.locator('#menu-btn').click();
    await expect(page.locator('#act-build')).toHaveClass(/coach-pulse/);
    await page.locator('#act-build').click();
    const rumah = page.locator('#sheet .card-btn', { hasText: /Rumah/ }).first();
    await expect(rumah).toHaveClass(/coach-pulse/);
    await expectLegible(page, 'opener, Pick step');
    await rumah.click();
    await expect(page.locator('#coach')).toBeVisible();
    const box = (await page.locator('#map').boundingBox())!;
    const at = await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      const k = app.s.buildings.find((b: any) => b.def === 'kantorRT');
      return app.view.tileCentre(k.x - 1, k.y + 2);
    });
    await page.mouse.click(box.x + at.x, box.y + at.y);
    await expect(page.locator('#place-ok')).toHaveClass(/coach-pulse/);
    await page.locator('#place-ok').click();
    await expect(page.locator('#coach-skip')).toHaveText(lang() === 'en' ? 'Got it' : 'Paham');
    await page.locator('#coach-skip').click();
    await expect(page.locator('#coach')).toBeHidden();
    // Got it stays dismissed: the note does not come back on the next check.
    await page.waitForTimeout(800);
    await expect(page.locator('#coach')).toBeHidden();
  });

  test('the first month passes without a pop-up over the opener', async ({ page }) => {
    await page.goto(`/?debug&coach&lang=${lang()}`);
    await passHome(page);
    await expect(page.locator('#coach')).toBeVisible();
    await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.runTick());
    await expect(page.locator('#modal')).toBeHidden();
    await expect(page.locator('#coach')).toBeVisible();
  });

  test('Skip ends the opener for good, even after a reload', async ({ page }) => {
    await page.goto(`/?debug&coach&lang=${lang()}`);
    await passHome(page);
    await expect(page.locator('#coach')).toBeVisible();
    await page.locator('#coach-skip').click();
    await expect(page.locator('#coach')).toBeHidden();
    await page.reload();
    await passHome(page);
    await page.waitForTimeout(600);
    await expect(page.locator('#coach')).toBeHidden();
  });
});

test.describe('tips', () => {
  test('a mechanic is taught once, on tap, and Skip tips silences the rest', async ({ page }) => {
    const RANKED = { id: 'Waktunya rapor.', en: 'Report card time.' }[lang()];
    await start(page);
    await page.locator('#howtoGo').click();
    await expect(page.locator('#modal')).toBeHidden();
    // Banjir has fired: its tip waits for a tap, with no timer.
    await page.evaluate(() => {
      const a = (window as unknown as { pakrt: any }).pakrt;
      a.s.lastEvent = { banjir: 0 };
      a.refresh();
    });
    await expect(page.locator('#modal .card h2')).toHaveText({ id: 'Musim hujan datang.', en: 'Rainy months are coming.' }[lang()]);
    await expectLegible(page, 'tip');
    await page.waitForTimeout(1500);
    await expect(page.locator('#modal')).toBeVisible();
    await page.locator('#modal .tap-hint').click();
    await expect(page.locator('#modal')).toBeHidden();
    // Seen once, never again, even after a reload.
    await page.reload();
    await passHome(page);
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

test.describe('population and houses', () => {
  test('the Build screen names both levers, and a house placed by hand fills up', async ({ page }) => {
    const POP_LINE = { en: /want to live here/, id: /ingin tinggal di sini/ }[lang()];
    const HOUSES = { en: 'Houses 3', id: 'Menampung 3' }[lang()];
    const ATTRACTS = { en: 'Attracts new residents', id: 'Menarik warga baru' }[lang()];
    await start(page);
    await dismissModals(page);
    await page.locator('#menu-btn').click();
    await page.locator('#act-build').click();
    await expect(page.locator('#sheet')).toContainText(POP_LINE);
    const rumah = page.locator('#sheet .card-btn', { hasText: HOUSES }).first();
    await expect(rumah).toBeVisible();
    await expect(rumah).toContainText(ATTRACTS);
    await expectLegible(page, 'Build with population numbers');
    await rumah.click();

    const box = (await page.locator('#map').boundingBox())!;
    const at = await page.evaluate(() => {
      // The map opens centred on the Kantor RT. The tile below-left of it touches the starting path, so the house works.
      const app = (window as unknown as { pakrt: any }).pakrt;
      const k = app.s.buildings.find((b: any) => b.def === 'kantorRT');
      return app.view.tileCentre(k.x - 1, k.y + 2);
    });
    await page.mouse.click(box.x + at.x, box.y + at.y);
    await expect(page.locator('#place-ok')).toBeEnabled();
    await page.locator('#place-ok').click();

    const before = await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.residents.length);
    await page.evaluate(() => {
      const a = (window as unknown as { pakrt: any }).pakrt;
      a.runTick();
      a.runTick();
    });
    const after = await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.residents.length);
    expect(after, 'a new house brings residents in').toBeGreaterThan(before);
    expect(await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.buildings.filter((b: any) => b.def === 'rumah').length)).toBe(3);
  });

  test('the tip fires when growth stalls and explains both levers once', async ({ page }) => {
    const TIP = { en: 'Beds and a reason.', id: 'Tempat dan alasan.' }[lang()];
    await start(page);
    await page.locator('#howtoGo').click();
    await page.evaluate(() => {
      const a = (window as unknown as { pakrt: any }).pakrt;
      a.runTick();
      a.runTick();
    });
    // "Fill the houses" comes first; tap through tips until this one is up.
    for (let i = 0; i < 8; i++) {
      if (!(await page.locator('#modal').isVisible())) {
        await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.refresh());
        await page.waitForTimeout(50);
        continue;
      }
      if ((await page.locator('#modal .card h2').textContent()) === TIP) break;
      await page.locator('#modal .tap-hint').click();
      await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.refresh());
      await page.waitForTimeout(50);
    }
    await expect(page.locator('#modal .card h2')).toHaveText(TIP);
    await expect(page.locator('#modal .pics')).toBeVisible();
    // The picture row says "beds" in words, not in an icon nobody can read.
    await expect(page.locator('#modal .pics')).toContainText(lang() === 'en' ? '3 beds' : '3 tempat');
    await expectLegible(page, 'houses tip');
    await page.locator('#modal .tap-hint').click();
    await expect(page.locator('#modal')).toBeHidden();
  });

  test('the Pop chip shows the live numbers', async ({ page }) => {
    const POP_LINE = { en: /want to live here/, id: /ingin tinggal di sini/ }[lang()];
    await start(page);
    await dismissModals(page);
    await page.locator('#chip-pop').click();
    await expect(page.locator('#modal .exp')).toBeVisible();
    await expect(page.locator('#modal .card p').first()).toContainText(POP_LINE);
    await expectLegible(page, 'pop explain card');
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
    await passHome(page);
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
  test('yearly report card is legible, pauses the game and dismisses on tap', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    // Tips off: an arrival on the month before the report would be shown first and hold it back.
    await skipTips(page);
    await seed(page);
    const title = (n: number) => ({ id: `Laporan tahun ${n}`, en: `Year ${n} report` })[lang()];
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.s.month = 10;
      app.s.quarter = undefined;
    });
    // Two months to the year end. A random event can pause one of them, so play through it
    // rather than hoping the draw is kind: the report still has to land on time.
    for (let i = 0; i < 3; i++) {
      if ((await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.month)) >= 12) break;
      await runMonth(page);
    }
    await expect(page.locator('#modal .card.report-card')).toBeVisible();
    await expect(page.locator('#modal .card h2')).toHaveText(title(1));
    await expect(page.locator('#modal .report-grade')).toBeVisible();
    await expect(page.locator('#modal .outcome-mod', { hasText: '☆' })).toBeVisible();
    await expect(page.locator('#modal .outcome-chip').first()).toBeVisible();
    await expectLegible(page, 'report card');
    const before = await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.month);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.month)).toBe(before);
    await page.locator('#modal .tap-hint').click();
    await expect(page.locator('#modal .card.report-card')).toBeHidden();
  });

  test('every event shows prices in one piece, and every result row names its resource', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await skipTips(page);
    await seed(page);
    const ids = ['agustusan', 'banjir', 'cabai', 'kecamatan', 'partTime', 'cctv', 'kkn', 'startupPilot', 'hajatan', 'pasarMalam', 'sisaAnggaran', 'magang', 'pungli', 'pangkalanOjol', 'lesGratis', 'padam', 'rapatWarga', 'hibah', 'lombaKampung', 'truckSampah', 'lubangViral', 'sembako', 'pbb', 'festivalKuliner'];
    for (const id of ids) {
      await page.evaluate((i) => {
        const app = (window as unknown as { pakrt: any }).pakrt;
        app.speed = 0;
        app.s.res.rupiah = 1e9;
        app.s.res.orangDalam = 50;
        app.s.pendingEvent = i;
        app.showEvent();
      }, id);
      const card = page.locator('#modal .card.event');
      await expect(card).toBeVisible();
      for (const price of await card.locator('.price').all()) {
        // A price on two lines would split the number from its word.
        expect(await price.evaluate((el) => el.getClientRects().length), `${id} price wraps`).toBe(1);
      }
      await expectLegible(page, `event ${id}`);
      await card.locator('.btn').last().click();
      for (const chip of await page.locator('#modal .outcome-chip').all()) {
        expect((await chip.locator('.outcome-name').textContent())?.trim(), `${id} result row has no word`).toBeTruthy();
      }
      await expectLegible(page, `result of ${id}`);
      await page.locator('#modal .tap-hint').click();
      await expect(page.locator('#modal')).toBeHidden();
    }
  });

  test('an event right after a tip is centred, not left at the bottom', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.modal({ title: 'Tip', body: 'A tip', tone: 'info', tip: { pics: null, skip: () => {} } });
      app.s.pendingEvent = 'agustusan';
      app.showEvent();
    });
    await expect(page.locator('#modal .card.event')).toBeVisible();
    await expectCentred(page, 'event after a tip');
  });

  for (const id of ['agustusan', 'banjir', 'cabai', 'kecamatan', 'kerjaBakti', 'musimPindahan', 'pendataanWarga', 'partTime', 'padam', 'hibah']) {
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
        await expectCentred(page, `event ${id}`);
        // The cost shows once, as a number and icon, never also spelled out in the label.
        for (const label of await page.locator('#modal .card.event .btn').allInnerTexts()) expect(label, `event ${id} choice`).not.toMatch(/Orang (Inside|Dalam)/);
        // The game is paused until a choice is made, and the first choice always works.
        const before = await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.month);
        await page.waitForTimeout(300);
        expect(await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.month)).toBe(before);
        await page.locator('#modal .card.event .btn').first().click();
        // The outcome is a tap-to-dismiss popup with the stat changes.
        await expect(page.locator('#modal .card h2')).toHaveText({ id: 'Hasil kejadian', en: 'Event result' }[lang()]);
        if (id !== 'banjir' && id !== 'kecamatan') await expect(page.locator('#modal .outcome-chip, #modal .outcome-mod').first()).toBeVisible();
        await expectLegible(page, `outcome ${id}`);
        await expectCentred(page, `outcome ${id}`);
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
    await page.locator('#menu-btn').click();
    await page.locator('#act-stats').click();
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
    await passHome(page);
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
    await passHome(page);
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
    await passHome(page);
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
    await passHome(page);
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
  });
});

test.describe('slim HUD and one menu', () => {
  test('main screen has only pause, speed and Menu buttons', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    const ids = await page.evaluate(() =>
      [...document.querySelectorAll('button')].filter((b) => b.getClientRects().length && b.id !== 'ticker').map((b) => b.id),
    );
    expect(ids).toEqual(['chip-rupiah', 'chip-sabar', 'chip-orangDalam', 'chip-viral', 'chip-pop', 'pause-btn', 'speed-btn', 'menu-btn']);
    const hud = (await page.locator('#hud').boundingBox())!;
    expect(hud.height).toBeLessThanOrEqual(80);
  });

  test('tapping a resource chip explains it and the card dismisses on tap', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    for (const id of ['rupiah', 'sabar', 'orangDalam', 'viral', 'pop']) {
      await page.locator(`#chip-${id}`).click();
      await expect(page.locator('#modal .exp')).toBeVisible();
      await expect(page.locator('#modal .exp-row')).toHaveCount(3);
      await expectLegible(page, `${id} explain card`);
      await page.locator('#modal').click();
      await expect(page.locator('#modal')).toBeHidden();
    }
    await expect(page.locator('#chip-pop')).toContainText('Pop');
    await expect(page.locator('#chip-sabar')).not.toContainText(/Sabar/);
  });

  test('menu and build mode hold game time, then resume; a manual pause stays', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    const pk = (fn: string) => page.evaluate(`(() => { const a = window.pakrt; return ${fn}; })()`);
    const badge = page.locator('#auto-pause');
    await expect(badge).toBeHidden();
    expect(await pk('a.running')).toBe(true);

    await page.locator('#menu-btn').click();
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText(WORDS[lang()].paused);
    expect(await pk('a.running')).toBe(false);
    expect(await pk('a.speed')).toBe(1);
    await page.getByRole('button', { name: WORDS[lang()].close }).click();
    await expect(badge).toBeHidden();
    expect(await pk('a.running')).toBe(true);

    await pk("a.startPlacing('rumah')");
    await expect(badge).toBeVisible();
    expect(await pk('a.running')).toBe(false);
    await pk('a.stopPlacing()');
    await expect(badge).toBeHidden();
    expect(await pk('a.running')).toBe(true);

    await page.locator('#pause-btn').click();
    await page.locator('#menu-btn').click();
    await page.getByRole('button', { name: WORDS[lang()].close }).click();
    expect(await pk('a.speed')).toBe(0);
    expect(await pk('a.running')).toBe(false);
  });

  test('pause toggles and speed cycles 1x, 2x (4x only from year 10)', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    const speed = () => page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.speed);
    for (const want of [2, 1, 2]) {
      await page.locator('#speed-btn').click();
      expect(await speed()).toBe(want);
      await expect(page.locator('#speed-btn')).toHaveText(`${want}x`);
    }
    await page.evaluate(() => { (window as unknown as { pakrt: any }).pakrt.s.month = 108; });
    await page.locator('#speed-btn').click();
    expect(await speed()).toBe(4);
    await page.locator('#pause-btn').click();
    expect(await speed()).toBe(0);
    await expect(page.locator('#pause-btn')).toHaveAttribute('aria-label', WORDS[lang()].play);
    await page.locator('#pause-btn').click();
    expect(await speed()).toBe(4);
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

    const panels = [['build', 'Build'], ['warga', 'Residents'], ['wacana', 'Policies'], ['combo', 'Combo Book'], ['log', 'Log'], ['stats', 'Treasury & ranking'], ['settings', 'Settings']] as const;
    for (const [id, name] of panels) {
      await page.locator('#menu-btn').click();
      await page.locator(`#act-${id}`).click();
      await expect(page.locator('#sheet')).toBeVisible();
      await expectLegible(page, `${name} panel`);
      await page.locator('.sheet-head .btn').click();
    }

    await page.locator('#menu-btn').click();
    await page.locator('#act-stats').click();
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
      // Aim at the roof, which overlaps the tile behind on screen. A level-1 Kantor RT is a low house,
      // so aim just under its ridge: still above the tile's own top corner.
      return { x: c.x, y: c.y - app.view.tile * 0.9 };
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
      // A road row hangs off the starting path, so the three shops below it have road access.
      const k = s.buildings.find((b: any) => b.def === 'kantorRT');
      const add = (d: string, x: number, y: number) => s.buildings.push({ uid: s.nextUid++, def: d, x, y, level: 1, status: 'active', timer: 0, invested: 0, placedAt: 0 });
      for (let i = 0; i < 4; i++) add('jalan', k.x + i, k.y + 3);
      (['warung', 'posRonda', 'wifi'] as const).forEach((d, i) => add(d, k.x + i, k.y + 4));
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
test.describe('home update button', () => {
  test('stays hidden until an update waits, then shows above Start inside the screen', async ({ page }) => {
    await page.goto(`/?debug&lang=${lang()}`);
    await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
    await expect(page.locator('#home-update')).toBeHidden();
    await page.evaluate(() => ((document.getElementById('home-update') as HTMLElement).hidden = false));
    const vh = page.viewportSize()!.height;
    const up = (await page.locator('#home-update').boundingBox())!;
    const st = (await page.locator('#home-start').boundingBox())!;
    expect(up.y).toBeGreaterThanOrEqual(0);
    expect(up.y + up.height).toBeLessThanOrEqual(st.y);
    expect(st.y + st.height).toBeLessThanOrEqual(vh);
    expect(up.height).toBeGreaterThanOrEqual(44);
    await expect(page.locator('#home-update')).toHaveText(lang() === 'id' ? 'Pembaruan tersedia' : 'Update available');
    await expectLegible(page, 'home with update');
  });
});
test.describe('walkers and effects', () => {
  /** Walker positions, rounded so idle bobbing does not count as moving. */
  const spots = (page: Page) =>
    page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.view.crowd.people.map((p: any) => `${p.fx.toFixed(2)},${p.fy.toFixed(2)}`).join(' '));

  /** Sim time stays still (speed 0) while the walkers are let loose, since a pause now freezes them too. */
  const letWalk = `(() => { const a = window.pakrt; a.speed = 0; Object.defineProperty(a, 'running', { get: () => true, configurable: true }); })()`;

  test('residents walk the map and ojol riders join them', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await seed(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.s.residents[0].job = 'ojol';
    });
    await page.evaluate(letWalk);
    await page.waitForTimeout(200);
    const people = await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.view.crowd.people);
    expect(people.length).toBeGreaterThan(4);
    expect(people.some((p: { kind: string }) => p.kind === 'ojol')).toBe(true);
    const before = await spots(page);
    await page.waitForTimeout(4500);
    expect(await spots(page)).not.toBe(before);
    // Nobody lingers inside a building. A walker leaving or reaching a door is on its tile for a moment, so a walker only
    // counts if it is inside at two samples a second apart.
    const insideNow = () =>
      page.evaluate(() => {
        const app = (window as unknown as { pakrt: any }).pakrt;
        const solid = app.s.buildings.filter((b: any) => !['biopori', 'parkir', 'jalan'].includes(b.def));
        return app.view.crowd.people.filter((p: any) => solid.some((b: any) => b.x === Math.floor(p.fx) && b.y === Math.floor(p.fy))).map((p: any) => p.id as number);
      });
    const first = await insideNow();
    await page.waitForTimeout(1000);
    const second = await insideNow();
    expect(first.filter((id: number) => second.includes(id))).toEqual([]);
  });

  test('walkers stay on paths, and a building with no path is marked and idle', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.speed = 0;
      app.s.buildings.push({ uid: app.s.nextUid++, def: 'warung', x: 0, y: 0, level: 1, status: 'active', timer: 0, invested: 0, placedAt: 0 });
      app.runTick();
    });
    await page.waitForTimeout(4000);
    const r = await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      const road = new Set(app.s.buildings.filter((b: any) => b.def === 'jalan').map((b: any) => `${b.x},${b.y}`));
      const off = app.view.crowd.people.filter((p: any) => p.kind !== 'ojol' && !road.has(`${Math.floor(p.fx)},${Math.floor(p.fy)}`)).length;
      const w = app.s.buildings.find((b: any) => b.def === 'warung');
      return { off, noRoad: !!w.noRoad, walkers: app.view.crowd.people.length };
    });
    expect(r.walkers).toBeGreaterThan(0);
    expect(r.off).toBe(0);
    expect(r.noRoad).toBe(true);
  });

  test('walkers stand still while paused, manually or by a menu, and walk on after', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await seed(page);
    const run = async () => {
      const a = await spots(page);
      await page.waitForTimeout(2500);
      return a !== (await spots(page));
    };
    expect(await run()).toBe(true);
    await page.locator('#pause-btn').click();
    await page.waitForTimeout(150);
    expect(await run()).toBe(false);
    await page.locator('#menu-btn').click();
    await page.waitForTimeout(150);
    expect(await run()).toBe(false);
    await page.getByRole('button', { name: WORDS[lang()].close }).click();
    await page.locator('#pause-btn').click();
    expect(await run()).toBe(true);
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

  test('a dense Kelurahan map keeps the frame rate', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    // 6x CPU throttle stands in for a mid-range phone.
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
    const fps = (busy: boolean) =>
      page.evaluate(
        (busy) =>
          new Promise<number>((done) => {
            const app = (window as unknown as { pakrt: any }).pakrt;
            app.speed = 0; Object.defineProperty(app, 'running', { get: () => true, configurable: true });
            app.settings.effects = busy;
            app.applySettings();
            let n = 0;
            const t0 = performance.now();
            const f = (now: number) => {
              n++;
              if (n % 20 === 0) app.handleFx([{ kind: 'pop', x: 4, y: 6, res: 'rupiah', amount: 900000 }]);
              if (now - t0 < 1500) requestAnimationFrame(f);
              else done((n * 1000) / (now - t0));
            };
            requestAnimationFrame(f);
          }),
        busy,
      );
    const best = async (busy: boolean, runs = 3) => {
      let top = 0;
      for (let i = 0; i < runs; i++) top = Math.max(top, await fps(busy));
      return top;
    };
    // A packed RT first, for scale.
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      const s = app.s;
      const defs = ['rumah', 'warung', 'posRonda', 'wifi', 'indomaret', 'alfamart', 'biopori'];
      let n = 0;
      const { w, h } = app.rt;
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++)
          if (!((x + y) % 2) && !s.buildings.some((o: any) => o.x === x && o.y === y))
            s.buildings.push({ uid: s.nextUid++, def: defs[n++ % defs.length], x, y, level: 1, status: 'active', timer: 0, invested: 0, placedAt: 0 });
      for (let i = 0; i < 16; i++) s.residents.push({ id: 900 + i, name: 'Mas Joko', job: i % 3 ? 'none' : 'ojol', pensiun: 0, fake: 0, arrived: 0 });
      s.month = 2;
    });
    const small = await best(false);
    // Then the whole Kelurahan, 16 times the tiles, with the same density.
    const size = await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.promote();
      app.promote();
      const s = app.s;
      const defs = ['rumah', 'warung', 'posRonda', 'wifi', 'indomaret', 'alfamart', 'biopori'];
      let n = 0;
      const { w, h } = app.rt;
      for (let y = 0; y < h * 4; y++)
        for (let x = 0; x < w * 4; x++) {
          if ((x + y) % 2) continue;
          const b = { uid: s.nextUid++, def: defs[n++ % defs.length], x, y, level: 1, status: 'active', timer: 0, invested: 0, placedAt: 0 };
          const hit = s.neighbours.find((nb: any) => Math.floor(x / w) === nb.cx && Math.floor(y / h) === nb.cy);
          if (hit) hit.buildings.push(b);
          else if (!s.buildings.some((o: any) => o.x === x && o.y === y)) s.buildings.push(b);
        }
      return { count: s.buildings.length + s.neighbours.reduce((t: number, nb: any) => t + nb.buildings.length, 0), cells: s.neighbours.length };
    });
    expect(size.cells).toBe(15);
    expect(size.count).toBeGreaterThan(1500);
    const big = await best(false);
    const bigBusy = await best(true, 5);
    console.log(`RT ${small.toFixed(0)} fps, Kelurahan ${big.toFixed(0)} fps, Kelurahan with effects ${bigBusy.toFixed(0)} fps`);
    // Only what is on screen costs anything, so 16 times the map must not cost half the frames.
    expect(big, `RT ${small.toFixed(0)} fps, Kelurahan ${big.toFixed(0)} fps`).toBeGreaterThan(small * 0.5);
    // The effects overhead is fixed, and the RT test above holds it to 80%. Here it only has to stay in the same league.
    // Shared runners swing this ratio between 0.4 and 0.6, so it takes the best of five and a 0.35 floor.
    expect(bigBusy, `Kelurahan ${big.toFixed(0)} fps, with effects ${bigBusy.toFixed(0)} fps`).toBeGreaterThan(big * 0.35);
  });

  test('a speech bubble is painted after every building and window light', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await seed(page);
    // Records the draw order: lit windows (L) and the bubble text (B). Other text (T) is floating numbers, which may sit on top.
    const order = await page.evaluate(
      () =>
        new Promise<string[]>((done) => {
          const app = (window as unknown as { pakrt: any }).pakrt;
          app.settings.effects = true;
          app.applySettings();
          app.s.month = 2;
          app.acc = 4800;
          const walker = app.view.crowd.people.find((p: any) => !p.away);
          const log: string[] = [];
          const proto = CanvasRenderingContext2D.prototype as any;
          const { fillRect, fillText, setTransform } = proto;
          proto.setTransform = function (...a: unknown[]) { log.push('F'); return setTransform.apply(this, a); };
          proto.fillRect = function (...a: unknown[]) { if (this.fillStyle === '#fde68a') log.push('L'); return fillRect.apply(this, a); };
          proto.fillText = function (text: string, ...a: unknown[]) { log.push(text === 'Layer check' ? 'B' : 'T'); return fillText.call(this, text, ...a); };
          let n = 0;
          const f = () => {
            walker.say = 'Layer check';
            walker.sayUntil = performance.now() + 5000;
            if (++n < 20) return requestAnimationFrame(f);
            Object.assign(proto, { fillRect, fillText, setTransform });
            done(log);
          };
          requestAnimationFrame(f);
        }),
    );
    expect(order.filter((o) => o === 'B').length, 'a bubble was drawn').toBeGreaterThan(0);
    expect(order.filter((o) => o === 'L').length, 'lit windows were drawn').toBeGreaterThan(0);
    let bubbled = false;
    for (const o of order) {
      if (o === 'F') bubbled = false;
      else if (o === 'B') bubbled = true;
      else if (bubbled && o === 'L') throw new Error(`"${o}" was painted over the speech bubble`);
    }
  });

  test('every overlay is on top at its own centre', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    const onTop = (sel: string) =>
      page.evaluate((sel) => {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (!el) return 'missing';
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return hit && el.contains(hit) ? 'ok' : `covered by ${hit?.id || hit?.className || hit?.tagName}`;
      }, sel);
    await page.locator('#menu-btn').click();
    expect(await onTop('#sheet')).toBe('ok');
    await page.getByRole('button', { name: WORDS[lang()].close }).click();
    await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.explain('rupiah'));
    expect(await onTop('#modal .card')).toBe('ok');
    await page.locator('#modal').click();
    await expect(page.locator('#modal')).toBeHidden();
    for (const sel of ['#hud', '#bottombar', '#menu-btn']) expect(await onTop(sel), sel).toBe('ok');
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

test.describe('stars', () => {
  test('Menu header shows the stage title and stars, and a tap lists what is missing', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await page.locator('#menu-btn').click();
    const head = page.locator('#stage-btn');
    await expect(head).toBeVisible();
    await expect(head).toContainText('☆☆☆');
    await expectLegible(page, 'menu stage header');
    await head.click();
    await expect(page.locator('.checklist li')).toHaveCount(2);
    await expect(page.locator('.checklist li').first()).toContainText(/\d/);
    await expectLegible(page, 'star checklist');
  });

  test('earning a star plays a message, then the SK at 3 stars can be declined and asked for again', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await page.evaluate(() => {
      const s = (window as unknown as { pakrt: any }).pakrt.s;
      s.stage.stars.rt = 2;
      s.res.sabar = 90;
      s.discovered.push('a', 'b', 'c');
      s.ranking = [{ year: 1, us: 1, them: 0, won: true }, { year: 2, us: 1, them: 0, won: true }];
      const r = s.residents[0];
      for (let i = 0; i < 40; i++) s.residents.push({ ...r, id: 500 + i });
      (window as unknown as { pakrt: any }).pakrt.runTick();
    });
    await expect(page.locator('#modal .card.fanfare').first()).toContainText('3★');
    await dismissModals(page);
    await page.locator('#menu-btn').click();
    await page.locator('#stage-btn').click();
    await page.locator('#sk-decline').click();
    await expect(page.locator('#sk-reoffer')).toBeVisible();
    await expectLegible(page, 'declined SK');
    await page.locator('#sk-reoffer').click();
    await expect(page.locator('#sk-accept')).toBeEnabled();
  });
});

test.describe('growing map', () => {
  test('after promotion the map is bigger, neighbours show in the Menu, and funding one works', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await seed(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.speed = 0;
      app.promote();
      app.s.res.rupiah = 50_000_000;
      app.refresh();
    });
    await dismissModals(page);
    await page.locator('#menu-btn').click();
    await page.locator('#act-neighbours').click();
    await expect(page.locator('.sheet .action')).toHaveCount(3);
    await expectLegible(page, 'neighbours panel');
    const before = await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.neighbours.map((n: any) => n.funded));
    await page.locator('.sheet .action .btn').first().click();
    const after = await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.neighbours.map((n: any) => n.funded));
    expect(after[0]).toBe(before[0] + 1);
    await expectLegible(page, 'neighbours panel after funding');
  });

  test('a tap on an AI RT opens the Neighbours panel instead of a build menu', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.speed = 0;
      app.promote();
    });
    await dismissModals(page);
    // Bring the second RT into view, then tap its first tile.
    const at = await page.evaluate(async () => {
      const v = (window as unknown as { pakrt: any }).pakrt.view;
      const { w, h } = (window as unknown as { pakrt: any }).pakrt.rt;
      const c = v.project(w + w / 2, h / 2);
      v.panBy(v.viewW / 2 - c.x, v.viewH / 2 - c.y);
      // Tap picking reads the last drawn frame, so let one draw after the pan.
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const p = v.project(w + w / 2, h / 2);
      return { x: p.x, y: p.y };
    });
    const box = (await page.locator('#map').boundingBox())!;
    await page.mouse.click(box.x + at.x, box.y + at.y);
    await expect(page.locator('.sheet')).toBeVisible();
    await expect(page.locator('.sheet .action')).toHaveCount(3);
  });
});

test.describe('RW stage', () => {
  test('the SK opens a playable RW, and its panels list the RW content legibly', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await seed(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.speed = 0;
      app.s.stage.stars.rt = 3;
      app.s.stage.sk = 'offered';
      app.refresh();
    });
    await dismissModals(page);
    await page.locator('#menu-btn').click();
    await page.locator('#stage-btn').click();
    await page.locator('#sk-accept').click();
    await dismissModals(page);
    expect(await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.stage.current)).toBe('rw');
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.s.stage.stars.rw = 2;
      app.s.res.rupiah = 80_000_000;
      app.s.residents.slice(0, 3).forEach((r: any) => (r.manual = true));
      const add = (def: string, x: number, y: number) => app.s.buildings.push({ uid: app.s.nextUid++, def, x, y, level: 1, status: 'active', timer: 0, invested: 0, placedAt: 0 });
      add('balaiRW', 12, 0); add('posyandu', 13, 0); add('portal', 12, 1); add('pasarKaget', 13, 1); add('gapura', 12, 2);
      app.refresh();
    });
    await dismissModals(page);

    await page.locator('#menu-btn').click();
    await page.locator('#act-build').click();
    // Build is split into tabs, so walk them until every RW building has shown up.
    const seen = new Set<string>();
    const tabs = await page.locator('.sheet .tabs .tab').count();
    for (let i = 0; i < tabs; i++) {
      await page.locator('.sheet .tabs .tab').nth(i).click();
      for (const name of ['Balai RW', 'Posyandu', 'Portal', 'Pasar Kaget', 'Gapura']) {
        if (await page.locator('.sheet .card-title strong', { hasText: new RegExp(`^${name}$`) }).count()) seen.add(name);
      }
      if (i === tabs - 1 || seen.size === 5) await expectLegible(page, `RW build menu tab ${i}`);
    }
    expect([...seen].sort()).toEqual(['Balai RW', 'Gapura', 'Pasar Kaget', 'Portal', 'Posyandu']);
    await page.locator('.sheet-head .btn').click();

    await page.locator('#menu-btn').click();
    await page.locator('#act-combo').click();
    await expect(page.locator('.sheet').getByText(lang() === 'en' ? /A health post and a barrier/ : /Pos kesehatan dan palang/).first()).toBeVisible();
    await expectLegible(page, 'RW Buku Combo');
    await page.locator('.sheet-head .btn').click();

    await page.locator('#menu-btn').click();
    await page.locator('#act-warga').click();
    await page.locator('.sheet .card-btn').first().click();
    await expect(page.locator('.sheet').getByText('Kader Posyandu').first()).toBeVisible();
    await expectLegible(page, 'RW job picker');
  });
});

test.describe('Kelurahan stage', () => {
  test('the RW SK offers Kelurahan or Desa, and the Desa path opens its build menu', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await seed(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.speed = 0;
      app.s.stage.stars.rt = 3;
      app.s.stage.sk = 'offered';
      app.refresh();
    });
    await dismissModals(page);
    await page.locator('#menu-btn').click();
    await page.locator('#stage-btn').click();
    await page.locator('#sk-accept').click();
    await dismissModals(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.s.stage.stars.rw = 3;
      app.s.stage.sk = 'offered';
      app.refresh();
    });
    await dismissModals(page);
    await page.locator('#menu-btn').click();
    await page.locator('#stage-btn').click();
    await expect(page.locator('#sk-accept-kelurahan')).toBeEnabled();
    await expectLegible(page, 'path choice');
    await page.locator('#sk-accept-desa').click();
    await dismissModals(page);
    const got = await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      return { stage: app.s.stage.current, path: app.s.stage.path };
    });
    expect(got).toEqual({ stage: 'kelurahan', path: 'desa' });
    await page.locator('#menu-btn').click();
    await page.locator('#act-build').click();
    // Build is split into tabs, so walk them until Balai Desa shows up.
    const tabs = await page.locator('.sheet .tabs .tab').count();
    let found = false;
    for (let i = 0; i < tabs && !found; i++) {
      await page.locator('.sheet .tabs .tab').nth(i).click();
      found = (await page.locator('.sheet .card-title strong', { hasText: /^Balai Desa$/ }).count()) > 0;
    }
    expect(found).toBe(true);
    await expectLegible(page, 'Desa build menu');
  });
});

test.describe('home screen', () => {
  const W = { id: { start: 'Mulai', wipe: 'Hapus dan mulai ulang' }, en: { start: 'Start', wipe: 'Wipe and start over' } };

  test('shows the map, only Start and a gear, and asks Continue or New game', async ({ page }) => {
    await page.goto(`/?debug&lang=${lang()}`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('#goal')).toBeHidden();
    await expect(page.locator('#home .home-title')).toHaveText(await page.title());
    await expect(page.locator('#home button:visible')).toHaveCount(2);
    await expect(page.locator('#home-start')).toHaveText(W[lang()].start);
    const vh = page.viewportSize()!.height;
    const box = (await page.locator('#home-start').boundingBox())!;
    expect(box.y).toBeGreaterThan((vh * 2) / 3);
    expect(await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.running)).toBe(false);
    await expectLegible(page, 'home');
    await page.locator('#home-start').click();
    // No save yet: New game only, no Continue.
    await expect(page.locator('#home-continue')).toHaveCount(0);
    await expectLegible(page, 'home choice, no save');
    await page.locator('#home-new').click();
    await expect(page.locator('#home')).toHaveCount(0);
    await expect(page.locator('#howto')).toBeVisible();
  });

  test('Continue keeps the save, New game asks before it wipes it', async ({ page }) => {
    await start(page);
    await page.locator('#howtoGo').click();
    await page.evaluate(() => {
      const a = (window as unknown as { pakrt: any }).pakrt;
      a.s.res.rupiah = 777_000;
      a.save();
    });
    await page.reload();
    await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
    await page.locator('#home-start').click();
    await expect(page.locator('#home-continue')).toBeVisible();
    await expectLegible(page, 'home choice, with save');
    await page.locator('#home-new').click();
    await expect(page.locator('#home-wipe')).toHaveText(W[lang()].wipe);
    await expectLegible(page, 'home wipe confirm');
    await page.locator('#home .btn:not(.btn-danger):not(.home-gear)').click();
    await page.locator('#home-continue').click();
    expect(await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.res.rupiah)).toBe(777_000);
    await expect(page.locator('#howto')).toBeHidden();
    await page.reload();
    await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
    await page.locator('#home-start').click();
    await page.locator('#home-new').click();
    await page.locator('#home-wipe').click();
    expect(await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.res.rupiah)).not.toBe(777_000);
    await expect(page.locator('#howto')).toBeVisible();
  });

  test('Install shows under Start only when the browser offers it, and hides once used', async ({ page }) => {
    await page.goto(`/?debug&lang=${lang()}`);
    await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('#home-install')).toBeHidden();
    await page.evaluate(() => {
      const e = new Event('beforeinstallprompt') as Event & { prompt: () => Promise<void>; userChoice: Promise<unknown> };
      e.prompt = async () => { (window as unknown as { asked: boolean }).asked = true; };
      e.userChoice = Promise.resolve({ outcome: 'accepted' });
      window.dispatchEvent(e);
    });
    await expect(page.locator('#home-install')).toBeVisible();
    const start = (await page.locator('#home-start').boundingBox())!;
    const install = (await page.locator('#home-install').boundingBox())!;
    expect(install.y).toBeGreaterThan(start.y);
    await expectLegible(page, 'home with install');
    await page.locator('#home-install').click();
    await expect(page.locator('#home-install')).toBeHidden();
    expect(await page.evaluate(() => (window as unknown as { asked?: boolean }).asked)).toBe(true);
  });

  test('the gear opens Settings over the home screen', async ({ page }) => {
    await page.goto(`/?debug&lang=${lang()}`);
    await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
    await page.locator('#home-gear').click();
    await expect(page.locator('#sheet')).toBeVisible();
    await expectLegible(page, 'settings over home');
  });
});

test.describe('build mode', () => {
  test('Build splits into category tabs that stay legible', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await page.locator('#menu-btn').click();
    await page.locator('#act-build').click();
    const tabs = page.locator('#sheet .tabs .tab');
    expect(await tabs.count()).toBeGreaterThan(2);
    await expect(page.locator('#sheet .tabs .tab[aria-pressed="true"]')).toHaveCount(1);
    await expectLegible(page, 'build tabs');
    // The four starting tabs share one row, so the first Rumah card stays on screen.
    if ((await tabs.count()) <= 4) {
      const tops = await tabs.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
      expect(new Set(tops).size, `tab tops ${tops}`).toBe(1);
    }
    // A card says "no permit" once: the blurb and the meta line must not both carry it.
    const rumah = page.locator('#sheet .card-btn', { hasText: /Rumah/ }).first();
    expect(((await rumah.innerText()).match(/no permit|tanpa izin/gi) ?? []).length).toBe(1);
    await page.locator('#sheet .tabs .tab[data-tab="decoration"]').click();
    await expect(page.locator('#sheet .card-btn').first()).toBeVisible();
    await expect(page.locator('#sheet .tabs .tab[data-tab="decoration"]')).toHaveAttribute('aria-pressed', 'true');
    await expectLegible(page, 'decor tab');
  });

  test('Place and Cancel sit right under the chosen tile', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.startPlacing('rumah'));
    await expect(page.locator('#place-float')).toBeHidden();
    const box = (await page.locator('#map').boundingBox())!;
    const at = await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      const k = app.s.buildings.find((b: any) => b.def === 'kantorRT');
      return app.view.tileCentre(k.x, k.y - 1);
    });
    await page.mouse.click(box.x + at.x, box.y + at.y);
    const float = page.locator('#place-float');
    await expect(float).toBeVisible();
    const fb = (await float.boundingBox())!;
    // Below the tile, or above it when the tile sits near the bottom edge. Never over the tile itself.
    const cy = box.y + at.y;
    expect(fb.y + fb.height <= cy - 4 || fb.y >= cy - 4).toBe(true);
    expect(Math.abs(fb.y + fb.height / 2 - cy)).toBeLessThan(160);
    expect(fb.y).toBeGreaterThanOrEqual(box.y);
    expect(fb.y + fb.height).toBeLessThanOrEqual(box.y + box.height);
    expect(Math.abs(fb.x + fb.width / 2 - (box.x + at.x))).toBeLessThan(fb.width);
    await expectLegible(page, 'place buttons under the tile');
    await page.locator('#place-ok').click();
    await expect(float).toBeHidden();
    expect(await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.buildings.filter((b: any) => b.def === 'rumah').length)).toBe(3);
  });

  test('a path takes a start tile, an end tile and Yes', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    const roads = () => page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.buildings.filter((b: any) => b.def === 'jalan').length);
    const had = await roads();
    await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.startPlacing('jalan'));
    const box = (await page.locator('#map').boundingBox())!;
    const tap = async (dx: number, dy: number) => {
      const at = await page.evaluate(([x, y]) => {
        const app = (window as unknown as { pakrt: any }).pakrt;
        const k = app.s.buildings.find((b: any) => b.def === 'kantorRT');
        return app.view.tileCentre(k.x + x, k.y + y);
      }, [dx, dy]);
      await page.mouse.click(box.x + at.x, box.y + at.y);
    };
    await tap(-2, 3);
    await expect(page.locator('#place-float')).toBeHidden();
    await tap(2, 3);
    await expect(page.locator('#place-ok')).toHaveText(lang() === 'en' ? 'Yes' : 'Ya');
    await expect(page.locator('#place-ok')).toBeEnabled();
    await expectLegible(page, 'path preview');
    await page.locator('#place-ok').click();
    expect(await roads()).toBe(had + 5);
  });
});

test.describe('moving and turning', () => {
  test('a placed building moves and turns for free from its inspector', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    const pk = <T,>(code: string) => page.evaluate((c) => new Function('a', `return ${c}`)((window as unknown as { pakrt: unknown }).pakrt), code) as Promise<T>;
    const uid = await pk<number>("a.s.buildings.find((b) => b.def === 'rumah').uid");
    const cash = await pk<number>('a.s.res.rupiah');
    await pk(`a.inspect(${uid})`);
    await expect(page.locator('#sheet .action-row .btn')).toHaveCount(2);
    await expectLegible(page, 'inspector with move and rotate');
    await page.locator('#sheet .action-row .btn').nth(1).click();
    expect(await pk(`a.s.buildings.find((b) => b.uid === ${uid}).rot`)).toBe(1);

    await page.locator('#sheet .action-row .btn').nth(0).click();
    await expect(page.locator('#place-float')).toBeVisible();
    const box = (await page.locator('#map').boundingBox())!;
    const at = await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      const k = app.s.buildings.find((b: any) => b.def === 'kantorRT');
      return app.view.tileCentre(k.x, k.y - 1);
    });
    await page.mouse.click(box.x + at.x, box.y + at.y);
    await expect(page.locator('#place-ok')).toBeEnabled();
    await page.locator('#place-ok').click();
    const k = await pk<{ x: number; y: number }>("a.s.buildings.find((b) => b.def === 'kantorRT')");
    expect(await pk<number>(`a.s.buildings.find((b) => b.uid === ${uid}).y`)).toBe(k.y - 1);
    expect(await pk<number>('a.s.res.rupiah')).toBe(cash);
  });
});

test.describe('zoom, big lots and the Warga list', () => {
  test('after picking a job, the Warga list stays on that resident', async ({ page }) => {
    await start(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      for (let i = 0; i < 30; i++) app.s.residents.push({ id: app.s.nextResidentId++, name: `Pak Budi ${i}`, job: 'none', pensiun: 0, fake: 0, arrived: 0 });
    });
    await dismissModals(page);
    await page.evaluate(() => { const app = (window as any).pakrt; app.actions.find((a: any) => a.id === 'warga').open(app); });
    const row = page.locator('#sheet [data-rid]').nth(25);
    const id = await row.getAttribute('data-rid');
    await row.scrollIntoViewIfNeeded();
    await row.click();
    // "No job" is always allowed, and picking it sends the player back to the list.
    await page.locator('#sheet .action .btn').first().click();
    const back = page.locator(`#sheet [data-rid="${id}"]`);
    await expect(back).toBeInViewport();
    await expect(back).toBeFocused();
    expect(await page.locator('#sheet').evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  });

  test('wheel and pinch zoom in and out in whole steps, and a pinch is not a tap', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    const scale = () => page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.view.scale as number);
    const box = (await page.locator('#map').boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const s0 = await scale();
    await page.mouse.move(cx, cy);
    await page.mouse.wheel(0, -120);
    await expect.poll(scale).toBe(s0 + 1);
    await page.mouse.wheel(0, 120);
    await page.mouse.wheel(0, 120);
    await expect.poll(scale).toBe(s0 - 1);
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', d: number) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }] });
    const before = await scale();
    await touch('touchStart', 20);
    for (const d of [30, 40, 50, 60]) await touch('touchMove', d);
    await touch('touchEnd', 0);
    await expect.poll(scale).toBeGreaterThan(before);
    await expect(page.locator('#modal')).toBeHidden();
    await expect(page.locator('#sheet')).toBeHidden();
    await expectLegible(page, 'zoomed map');
  });

  test('a 3x3 Lapangan opens from a tap on its middle at default and zoomed-in scale', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      const k = app.s.buildings.find((b: any) => b.def === 'kantorRT');
      app.s.buildings.push({ uid: 9001, def: 'lapangan', x: k.x - 4, y: k.y - 4, level: 1, status: 'active', timer: 0, invested: 0, placedAt: 0 });
      app.refresh();
    });
    for (const zoom of [0, 1]) {
      if (zoom) await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.view.zoomBy(1));
      await page.waitForTimeout(150);
      // The middle tile of the field, not the building's own corner tile.
      const at = await page.evaluate(() => {
        const app = (window as unknown as { pakrt: any }).pakrt;
        const b = app.s.buildings.find((o: any) => o.uid === 9001);
        const c = app.view.tileCentre(b.x + 1, b.y + 1);
        const r = document.getElementById('map')!.getBoundingClientRect();
        return { x: r.left + c.x, y: r.top + c.y };
      });
      await page.mouse.click(at.x, at.y);
      await expect(page.locator('#sheet')).toBeVisible();
      await expect(page.locator('#sheet h2').first()).toContainText('Lapangan');
      await page.locator('#sheet .sheet-head .btn-icon').click();
    }
  });
});

test.describe('path decay, level art and menu icons', () => {
  test('a cracked path offers a tile fix, a stretch fix and a favour, and the favour fixes the stretch', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    const uid = await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      const s = app.s;
      s.month = 30;
      s.res.orangDalam = 3;
      const k = s.buildings.find((b: any) => b.def === 'kantorRT');
      const ids: number[] = [];
      for (let i = 0; i < 3; i++) {
        const b = { uid: s.nextUid++, def: 'jalan', x: k.x - 3 + i, y: k.y - 3, level: 1, status: 'damaged', timer: 0, invested: 0, placedAt: 0, crackedAt: 20 };
        s.buildings.push(b);
        ids.push(b.uid);
      }
      app.refresh();
      return ids[1];
    });
    // A tutorial tip can pop up over the map first. Clear it, then open the path.
    await dismissModals(page);
    await page.evaluate((u) => (window as unknown as { pakrt: any }).pakrt.inspect(u), uid);
    await dismissModals(page);
    const sheet = page.locator('#sheet');
    await expect(sheet).toBeVisible();
    // Fix this tile, fix all 3 tiles, call a favour that fixes all 3.
    await expect(sheet.locator('.action .btn', { hasText: /3 (tiles|petak)/ })).toHaveCount(2);
    await expect(sheet.locator('.action .btn', { hasText: /Orang/ })).toHaveCount(1);
    await expectLegible(page, 'cracked path inspector');
    await sheet.locator('.action .btn', { hasText: /Orang/ }).click();
    const left = await page.evaluate(() => (window as unknown as { pakrt: any }).pakrt.s.buildings.filter((b: any) => b.def === 'jalan' && b.status === 'damaged').length);
    expect(left).toBe(0);
    expect(await page.evaluate((u) => (window as unknown as { pakrt: any }).pakrt.s.buildings.find((b: any) => b.uid === u).status, uid)).toBe('active');
  });

  test('the inspector shows every level of a building and marks the current one', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      const b = { uid: 9100, def: 'warung', x: 1, y: 1, level: 2, status: 'active', timer: 0, invested: 0, placedAt: 0 };
      app.s.buildings.push(b);
      app.inspect(b.uid);
    });
    const strip = page.locator('#sheet .level-strip');
    await expect(strip.locator('.lv')).toHaveCount(3);
    await expect(strip.locator('.lv.current')).toHaveCount(1);
    await expect(strip.locator('.lv').nth(1)).toHaveClass(/current/);
    for (const img of await strip.locator('img').all()) expect(await img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    await expectLegible(page, 'level strip');
  });

  test('every menu tile has a drawn icon plate', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await page.locator('#menu-btn').click();
    const imgs = page.locator('#sheet .tile img');
    expect(await imgs.count()).toBeGreaterThan(5);
    for (const img of await imgs.all()) {
      expect(await img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth >= 44)).toBe(true);
      expect(await img.getAttribute('width')).toBe('44');
    }
    await expectLegible(page, 'menu with icon plates');
  });
});

test.describe('sheets keep their place', () => {
  test('the Build tab row does not jump when switching tabs', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await skipTips(page);
    await seed(page);
    await page.evaluate(() => ((window as unknown as { pakrt: any }).pakrt.speed = 0));
    await page.locator('#menu-btn').click();
    await page.locator('#act-build').click();
    const tabs = page.locator('.sheet .tabs .tab');
    const n = await tabs.count();
    expect(n).toBeGreaterThan(1);
    let top: number | undefined;
    for (let i = 0; i < n; i++) {
      await tabs.nth(i).click();
      const y = (await tabs.first().boundingBox())!.y;
      top ??= y;
      expect(Math.abs(y - top), `tab ${i} moved the tab row`).toBeLessThanOrEqual(1);
    }
  });

  test('the SK choices stack at the same width', async ({ page }) => {
    await start(page);
    await dismissModals(page);
    await skipTips(page);
    await page.evaluate(() => {
      const app = (window as unknown as { pakrt: any }).pakrt;
      app.speed = 0;
      app.s.stage.stars.rt = 3;
      app.s.stage.sk = 'offered';
      app.refresh();
    });
    await dismissModals(page);
    await page.locator('#menu-btn').click();
    await page.locator('#stage-btn').click();
    const widths = await page.locator('.sheet > .btn').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)));
    expect(widths.length).toBeGreaterThan(1);
    expect(new Set(widths).size, `button widths ${widths}`).toBe(1);
    await expectLegible(page, 'stage sheet');
  });
});
