import { test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { scanLegibility } from '../tests/e2e/legibility';
import { countScreen, DENSITY_ALLOW, LIMITS, scanLabelWords } from '../tests/e2e/density';
import { scanCentring } from '../tests/e2e/vcenter';

/**
 * Opens every screen a player can reach at each stage and runs the e2e scans on it: legibility (rules 1, 4, 5),
 * density and primary buttons (13, 14), label words (16) and vertical centring (18). Each screen is screenshotted for
 * the rules checked by eye (2, 3, 6, 9, 11). One JSON file per project goes to audit/out/; `node audit/report.mjs`
 * turns them into audit/report.md.
 */
type Row = { seed: string; screen: string; legibility: string[]; density: string[]; labels: string[]; centring: string[] };
const SEEDS = ['rt3', 'rw', 'kel', 'kec'] as const;
const app = (page: Page, js: string) => page.evaluate(js);

for (const seed of SEEDS) {
  test(seed, async ({ page }) => {
    const [, lang, theme] = test.info().project.name.split('-');
    const shots = `audit/out/shots/${test.info().project.name}`;
    mkdirSync(shots, { recursive: true });
    const rows: Row[] = [];
    page.setDefaultTimeout(8000);
    await page.addInitScript(([t, l]) => {
      try {
        const s = JSON.parse(localStorage.getItem('pakrt.settings') ?? '{}');
        localStorage.setItem('pakrt.settings', JSON.stringify({ ...s, theme: t, lang: l }));
        localStorage.setItem('pakrt.howto', '1');
        localStorage.setItem('pakrt.coach', 'done');
      } catch { /* storage off: the audit still runs in the defaults */ }
    }, [theme, lang]);
    await page.goto(`/?debug&lang=${lang}`);
    await page.waitForFunction(() => (window as unknown as { pakrt?: unknown }).pakrt);
    await page.evaluate(() => document.fonts.ready);
    if (seed === 'rt3') {
      await check(page, rows, seed, 'home', '#home');
      await page.locator('#home-start').click();
      await check(page, rows, seed, 'home choose', '#home');
      await page.locator('#home-new').click();
      await check(page, rows, seed, 'setup', '#home');
      await page.locator('#home-begin').click();
    } else {
      await page.locator('#home-start').click();
      if (await page.locator('#home-continue').isVisible()) await page.locator('#home-continue').click();
      else { await page.locator('#home-new').click(); await page.locator('#home-begin').click(); }
    }
    await dismiss(page);
    await app(page, 'window.pakrtTips.seeAll()');
    await app(page, `window.pakrt.loadSeed('${seed === 'kec' ? 'kel' : seed}')`);
    if (seed === 'kec') await app(page, "(() => { const a = window.pakrt; a.s.stage.stars.kelurahan = 3; a.s.stage.sk = 'offered'; a.accept(); })()");
    await page.waitForTimeout(800);
    // Cards that a stage change brings are screens too.
    await dismiss(page, rows, seed);
    await app(page, 'window.pakrt.setSpeed(0)');
    await check(page, rows, seed, 'map', 'body');
    if (await page.locator('#goal-now').isVisible()) {
      await page.locator('#goal-now').click();
      await check(page, rows, seed, 'goal list', '#goal');
      await page.locator('#goal-now').click();
    }
    await page.locator('#menu-btn').click();
    await check(page, rows, seed, 'menu', '#sheet');
    const ids = await page.$$eval('#sheet [id^="act-"]', (els) => els.map((e) => e.id.slice(4)));
    await closeSheet(page);
    for (const id of [...ids, 'build', 'warga', 'staff']) {
      await dismiss(page, rows, seed);
      if (id === 'build' || id === 'warga' || id === 'staff') await page.locator(`#dock-${id}`).click();
      else {
        await page.locator('#menu-btn').click();
        await page.waitForTimeout(200);
        await page.locator(`#act-${id}`).click();
      }
      await page.waitForTimeout(400);
      if (await page.locator('#sheet').isVisible()) await check(page, rows, seed, id, '#sheet');
      else if (await page.locator('#modal').isVisible()) await check(page, rows, seed, id, '#modal');
      if (id === 'build') {
        const tabs = await page.$$('#sheet .tabs .tab');
        for (let i = 1; i < tabs.length; i++) {
          await tabs[i].click();
          await page.waitForTimeout(200);
          await check(page, rows, seed, `build tab ${i + 1}`, '#sheet');
        }
      }
      if (id === 'neighbours' && (await page.locator('#sheet [data-nb-row]').count())) {
        await page.locator('#sheet [data-nb-row]').first().click();
        await page.waitForTimeout(300);
        await check(page, rows, seed, 'neighbour detail', '#sheet');
      }
      if (id === 'wacana' && (await page.locator('#sheet .wac-row').count())) {
        await page.locator('#sheet .wac-row').first().click();
        await check(page, rows, seed, 'wacana detail', '#sheet');
      }
      await closeSheet(page);
    }
    // One event card, on the first event that comes.
    for (let i = 0; i < 60; i++) {
      await app(page, 'window.pakrt.runTick()');
      if (await page.locator('#modal .card.event').isVisible()) {
        await check(page, rows, seed, 'event', '#modal');
        break;
      }
      if (await page.locator('#modal').isVisible()) await dismiss(page, rows, seed);
    }
    mkdirSync('audit/out', { recursive: true });
    writeFileSync(`audit/out/${test.info().project.name}-${seed}.json`, JSON.stringify(rows, null, 1));
  });
}

async function check(page: Page, rows: Row[], seed: string, screen: string, sel: string): Promise<void> {
  await page.waitForTimeout(150);
  const legibility = (await scanLegibility(page)).map((p) => `${p.rule} ${p.detail}: "${p.text.slice(0, 40)}"`);
  const c = await countScreen(page, screen, sel);
  // A screen on the e2e allowlist is a known fail, capped at its count there: marked, so the report can keep it apart.
  const cap = { ...LIMITS, ...DENSITY_ALLOW[screen] };
  const density = c ? (Object.keys(LIMITS) as (keyof typeof LIMITS)[]).filter((k) => c[k] > LIMITS[k]).map((k) => `${c[k] <= cap[k] ? '(allowlisted) ' : ''}${k} ${c[k]} > ${LIMITS[k]}`) : [];
  const labels = (await scanLabelWords(page)).map((l) => `${l.words} words "${l.text}"`);
  const centring = (await scanCentring(page)).map((o) => `"${o.text.slice(0, 30)}" ${o.above}/${o.below}px`);
  rows.push({ seed, screen, legibility, density, labels, centring });
  await page.screenshot({ path: `audit/out/shots/${test.info().project.name}/${seed}-${screen.replace(/[^\w]+/g, '_')}.png` });
}

async function dismiss(page: Page, rows?: Row[], seed?: string): Promise<void> {
  for (let i = 0; i < 20; i++) {
    if (await page.locator('#howto').isVisible()) await page.locator('#howtoGo').click();
    else if (await page.locator('#modal').isVisible()) {
      const title = ((await page.locator('#modal h2').first().textContent().catch(() => '')) ?? '').trim().slice(0, 24);
      if (rows && seed && !rows.some((r) => r.screen === `card ${title}`)) await check(page, rows, seed, `card ${title}`, '#modal');
      if (await page.locator('#modal .card.event').isVisible()) await page.locator('#modal .card.event .btn').first().click();
      else await page.locator('#modal').click({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(600);
    } else if (await page.locator('.coach-skip, #coach-skip').first().isVisible().catch(() => false)) await page.locator('#coach-skip').click();
    else return;
  }
}

async function closeSheet(page: Page): Promise<void> {
  if (await page.locator('#sheet').isVisible()) await page.locator('#sheet .sheet-head .btn-icon').last().click();
  await page.waitForTimeout(250);
}
