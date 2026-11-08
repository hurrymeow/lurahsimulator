import { mkdirSync, writeFileSync } from 'node:fs';
import { type Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { act, closeSheet, decide, dismissPopup, readCards, readScreen } from './screen-bot';
import { gameSeconds, score, type Verdict } from './screen-bot-score';
import { setLang } from '../../src/i18n';
import type { GameState } from '../../src/sim/types';

/**
 * Screen-only playtest bot (docs/plans/first-2h-playtest.md, T2). Nightly only: playwright.config.ts leaves it out unless
 * SCREEN_BOT is set. The player (screen-bot.ts) reads visible text and taps. This file is the recorder and scorer harness:
 * it is the only code here that reads the sim, and nothing it reads goes back to the player.
 *
 * It plays at 2x on a fake clock, so a run does not wait in real time and a sheet or popup costs no game time.
 */

const lang = (): 'id' | 'en' => (test.info().project.name.endsWith("-en") ? 'en' : 'id');
const CHECKPOINT_MS = 30_000; // 60s of game time at 2x
const MAX_GAME_S = 20 * 60; // the run stops here if RT 3★ never comes
const OUT = process.env.SCREEN_BOT_OUT ?? 'reports/screen-bot';

interface Row {
  trigger: 'minute' | 'popup';
  t: number;
  goal: string;
  rows: string;
  action: string;
  detail: string;
  before: GameState;
  tapped: boolean;
  shot?: string;
}

/** The recorder: a copy of the sim state, read only here. */
const snapshot = (page: Page): Promise<GameState> => page.evaluate(() => JSON.parse(JSON.stringify((window as unknown as { pakrt: { s: unknown } }).pakrt.s)));

async function passHome(page: Page): Promise<void> {
  await page.locator('#home-start').click();
  await page.locator('#home-new').click();
  await page.locator('#home-begin').click();
  await expect(page.locator('#home')).toHaveCount(0);
  if (await page.locator('#howtoGo').isVisible()) await page.locator('#howtoGo').click();
}

const csv = (v: string | number): string => `"${String(v).replace(/"/g, '""').replace(/\s+/g, ' ')}"`;

test('screen-only bot plays the first stars from visible text', async ({ page }, testInfo) => {
  test.setTimeout(20 * 60_000);
  test.skip(!process.env.SCREEN_BOT, 'Nightly only');
  setLang(lang());
  await page.clock.install({ time: new Date('2030-01-01T00:00:00Z') });
  await page.goto(`/?debug&lang=${lang()}`);
  await page.locator('#home-start').waitFor();
  await passHome(page);
  // 2x. The speed button cycles 1x and 2x.
  if ((await page.locator('#speed-btn').textContent())?.trim() !== '2x') await page.locator('#speed-btn').click();

  const rows: Row[] = [];
  const shots = `${OUT}/${testInfo.project.name}`;
  mkdirSync(shots, { recursive: true });
  const decideRound = async (trigger: Row['trigger']): Promise<void> => {
    for (let n = 0; n < 4; n++) {
      const screen = await readScreen(page);
      const cards = await readCards(page);
      const action = decide(screen, cards);
      const before = await snapshot(page);
      const tapped = await act(page, action);
      await closeSheet(page);
      if (process.env.SCREEN_BOT_LOG) console.log(trigger, gameSeconds(before), action.kind, 'name' in action ? action.name : '', tapped);
      const row: Row = { trigger, t: gameSeconds(before), goal: screen.goal, rows: screen.rows.join(' / '), action: action.kind === 'build' ? `build ${action.name}` : action.kind, detail: action.why, before, tapped };
      rows.push(row);
      // The screen is kept for every miss, taken before the verdict is known: the sheet is closed, the map and pill are shown.
      row.shot = `${shots}/t${String(row.t).padStart(4, '0')}-${rows.length}.png`;
      await page.screenshot({ path: row.shot });
      if (action.kind !== 'build' || !tapped) return;
    }
  };

  const wallEnd = Date.now() + 14 * 60_000; // a stalled run still writes its CSV
  let stars3At: number | null = null;
  let lastRounds = -1;
  while (!stars3At) {
    // Popups and event cards are answered as a player would, and each one counts as a checkpoint.
    let popped = false;
    for (let i = 0; i < 6 && (await page.locator('#modal').isVisible()); i++) {
      if (await dismissPopup(page)) popped = true;
      await page.clock.runFor(700);
    }
    if (popped) await decideRound('popup');
    const now = await snapshot(page);
    if (now.stage.stars.rt === 3) {
      stars3At = gameSeconds(now);
      break;
    }
    if (gameSeconds(now) > MAX_GAME_S || Date.now() > wallEnd) break;
    if (Math.floor(gameSeconds(now) / 60) !== lastRounds) {
      lastRounds = Math.floor(gameSeconds(now) / 60);
      await decideRound('minute');
    }
    await page.clock.runFor(CHECKPOINT_MS / 6);
  }
  const final = await snapshot(page);
  if (final.stage.stars.rt === 3 && stars3At === null) stars3At = gameSeconds(final);

  // Scorer: each row against the next snapshot, about 60s of game time on (the last row against the final state).
  const scored = rows.map((r, i) => {
    const next = rows.slice(i + 1).find((x) => x.t >= r.t + 45)?.before ?? final;
    const kind = r.action.startsWith('build') ? 'build' : (r.action as 'sk' | 'wait' | 'cant-tell');
    const sc = r.tapped ? score(kind, r.before, next) : { verdict: 'wrong' as Verdict, reason: 'the tap path failed: no spot or card found' };
    return { ...r, ...sc };
  });
  const right = scored.filter((r) => r.verdict === 'right').length;
  const pct = scored.length ? (100 * right) / scored.length : 0;

  mkdirSync(OUT, { recursive: true });
  const header = 'time_s_1x,trigger,visible_goal,visible_rows,chosen_action,why,verdict,reason,screenshot';
  const lines = scored.map((r) => [r.t, r.trigger, r.goal, r.rows, r.action, r.detail, r.verdict, r.reason, r.verdict === 'right' ? '' : r.shot ?? ''].map(csv).join(','));
  writeFileSync(`${OUT}/${testInfo.project.name}.csv`, [header, ...lines].join('\n'));
  writeFileSync(`${OUT}/${testInfo.project.name}.summary.json`, JSON.stringify({ checkpoints: scored.length, right, pct, rt3StarAtMin1x: stars3At === null ? null : stars3At / 60 }, null, 2));
  testInfo.annotations.push({ type: 'screen-bot', description: `${right}/${scored.length} right (${pct.toFixed(0)}%), RT 3★ at ${stars3At === null ? 'never' : (stars3At / 60).toFixed(1)} min` });

  expect.soft(pct, `checkpoints right: ${right} of ${scored.length}`).toBeGreaterThanOrEqual(90);
  expect.soft(stars3At, 'RT 3★ reached').not.toBeNull();
  if (stars3At !== null) expect.soft(stars3At / 60, 'RT 3★ in the builder band (min, 1x)').toBeGreaterThanOrEqual(9);
  if (stars3At !== null) expect.soft(stars3At / 60, 'RT 3★ in the builder band (min, 1x)').toBeLessThanOrEqual(12);
});
