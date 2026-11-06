import { test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
const SP = '/tmp/claude-0/-home-user-lurahsimulator/314e3fbd-c738-5b20-9adb-09d6633d2373/scratchpad/t7';
const lang = () => (test.info().project.name.endsWith('-en') ? 'en' : 'id');
async function clear(page: Page) {
  for (let i = 0; i < 15; i++) {
    if (await page.locator('#howto').isVisible()) { await page.locator('#howtoGo').click(); continue; }
    if (!(await page.locator('#modal').isVisible())) { await page.waitForTimeout(700); if (!(await page.locator('#modal').isVisible())) return; }
    const h = await page.locator('#modal h2').first().textContent({ timeout: 1000 }).catch(() => '?');
    await page.screenshot({ path: `${SP}/${test.info().title}-${lang()}-card${i}.png` });
    console.log(test.info().title, lang(), 'card', i, h);
    if (await page.locator('#modal .card.event').isVisible()) await page.locator('#modal .card.event .btn').first().click();
    else await page.locator('#modal').click({ position: { x: 8, y: 8 } });
    await page.waitForTimeout(650);
  }
}
for (const stop of [3, 4, 5, 6, 7]) {
  test(`s${stop}`, async ({ page }) => {
    await page.goto(`/?debug&lang=${lang()}`);
    await page.waitForFunction(() => (window as any).pakrt);
    await page.evaluate((raw) => localStorage.setItem('pakrt.save', raw), readFileSync(`${SP}/stop${stop}.json`, 'utf8'));
    await page.goto(`/?debug&lang=${lang()}`);
    await page.waitForFunction(() => (window as any).pakrt);
    await page.locator('#home-start').click();
    await page.locator('#home-continue').click();
    await page.waitForTimeout(800);
    await clear(page);
    await page.evaluate(() => { const a = (window as any).pakrt; a.paused = true; });
    await page.screenshot({ path: `${SP}/s${stop}-${lang()}-map.png` });
    await page.locator('#goal .goal-now').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SP}/s${stop}-${lang()}-goals.png` });
    console.log('GOALS', stop, lang(), (await page.locator('#goal').innerText()).replace(/\n+/g, ' | '));
    await page.locator('#goal .goal-now').click();
    await page.locator('#menu-btn').click();
    await page.locator('#act-neighbours').click().catch(() => console.log('no neighbours'));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SP}/s${stop}-${lang()}-neigh.png` });
  });
}
