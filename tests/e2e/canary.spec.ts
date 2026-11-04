// Canaries (TESTING.md item 15): each check is shown a planted fault and must catch it. A scan that can never fail
// proves nothing, so these keep the legibility, centring and console checks honest.
import { test as base } from '@playwright/test';
import { expect, test } from './fixtures';
import { scanLegibility } from './legibility';
import { scanCentring } from './vcenter';
import { scanLabelWords } from './density';

const lang = (): 'id' | 'en' => (test.info().project.name.endsWith('-en') ? 'en' : 'id');

async function open(page: import('@playwright/test').Page): Promise<void> {
  await page.goto(`/?debug&lang=${lang()}`);
  await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
  await page.evaluate(() => document.fonts.ready);
}

/** Plants an element into the home screen and returns the rules the legibility scan reports for it. */
async function plant(page: import('@playwright/test').Page, html: string): Promise<string[]> {
  await page.evaluate((h) => {
    const box = document.createElement('div');
    box.id = 'canary';
    box.innerHTML = h;
    (document.getElementById('home') ?? document.body).append(box);
  }, html);
  const found = (await scanLegibility(page)).map((p) => p.rule);
  await page.evaluate(() => document.getElementById('canary')?.remove());
  return found;
}

test.describe('canaries: every check can fail', () => {
  test('the legibility scan catches a clipped label, small text, an ellipsis and a small button', async ({ page }) => {
    await open(page);
    expect(await scanLegibility(page), 'the page is clean before planting').toEqual([]);
    expect(await plant(page, '<p style="width:40px;overflow:hidden;white-space:nowrap;font-size:16px">A label far too long for its box</p>')).toContain('clipped');
    expect(await plant(page, '<p style="font-size:11px">Small print nobody can read</p>')).toContain('font-size');
    expect(await plant(page, '<p style="width:60px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:16px">Cut off with dots</p>')).toContain('ellipsis');
    expect(await plant(page, '<button class="btn" style="min-width:0;min-height:0;width:30px;height:30px;padding:0">Go</button>')).toContain('touch-target');
  });

  test('the centring scan catches a label stuck to the top of its button', async ({ page }) => {
    await open(page);
    await page.evaluate(() => {
      const b = document.createElement('button');
      b.className = 'btn';
      b.id = 'canary-btn';
      b.style.cssText = 'display:flex;align-items:flex-start;height:80px';
      b.textContent = 'Top heavy';
      document.body.append(b);
    });
    const off = await scanCentring(page);
    expect(off.some((o) => o.text === 'Top heavy')).toBe(true);
  });

  test('the label-word scan catches a button over 6 words', async ({ page }) => {
    await open(page);
    await page.evaluate(() => {
      const b = document.createElement('button');
      b.className = 'btn';
      b.textContent = 'Please tap here to open the whole thing';
      document.body.append(b);
    });
    expect((await scanLabelWords(page)).some((l) => l.words === 8)).toBe(true);
  });
});

// The console guard itself, on the plain Playwright test so the planted error does not fail this test.
base('canary: a page error and a console.error are both seen', async ({ page }) => {
  const seen: string[] = [];
  page.on('pageerror', (e) => seen.push(`pageerror: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && seen.push(`console.error: ${m.text()}`));
  await page.goto(`/?debug&lang=id`);
  await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
  await page.evaluate(() => {
    console.error('canary console error');
    setTimeout(() => {
      throw new Error('canary page error');
    });
  });
  await page.waitForTimeout(200);
  expect(seen).toEqual(expect.arrayContaining(['console.error: canary console error', 'pageerror: canary page error']));
});

// And the guard fails a test that logs one: marked as an expected failure, so a guard that lets it through fails here.
test('canary: the console guard fails a test whose page logs an error', async ({ page }) => {
  test.fail();
  await page.goto(`/?debug&lang=id`);
  await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
  await page.evaluate(() => console.error('canary console error'));
});
