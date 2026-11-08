import { type Page } from '@playwright/test';
import { bName, t } from '../../src/i18n';
import { allDefs } from '../../src/sim/content';

/**
 * The player of the screen-only bot (docs/plans/first-2h-playtest.md, T2).
 *
 * THIS FILE NEVER READS THE GAME STATE. It sees what a player sees: visible text, buttons and the map canvas. It never
 * touches the debug handle on window. The recorder and scorer live in screen-bot.spec.ts and screen-bot-score.ts; they
 * read the sim, and nothing they read flows back into `readScreen`, `readCards`, `decide` or `act`. A unit test greps
 * this file for the debug handle's name.
 */

export interface Card {
  /** The building's name as the card prints it. */
  name: string;
  /** The card is greyed out: a requirement is missing or the money is short. */
  locked: boolean;
  /** How many the player owns, from the card's own "×n" tag. */
  owned: number;
}

export interface Screen {
  /** The goal pill's line, for example "Goal: build your first Rumah". Empty when the pill is hidden. */
  goal: string;
  /** The pill opened: every unmet ★ line, its how-to line, the next step and the combo pieces. */
  rows: string[];
}

export type Action =
  | { kind: 'build'; name: string; why: string }
  | { kind: 'sk'; why: string }
  | { kind: 'wait'; why: string }
  | { kind: 'cant-tell'; why: string };

/** Building names the game can print, longest first, so a long name wins over a shorter one inside it. */
const names = (): string[] => [...new Set(allDefs().filter((d) => d.placeable).map((d) => bName(d)))].sort((a, b) => b.length - a.length);

/** What a player reads: the goal pill, then the pill opened. */
export async function readScreen(page: Page): Promise<Screen> {
  if (!(await page.locator('#goal').isVisible())) return { goal: '', rows: [] };
  const goal = ((await page.locator('#goal .goal-text').textContent()) ?? '').trim();
  const now = page.locator('#goal-now');
  const wasOpen = (await now.getAttribute('aria-expanded')) === 'true';
  if (!wasOpen && (await now.getAttribute('data-more')) === 'true') await now.click();
  const rows = (await page.locator('#goal .goal-star > *').allTextContents()).map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean);
  if (!wasOpen && (await now.getAttribute('aria-expanded')) === 'true') await now.click();
  return { goal, rows };
}

/** Opens Build and reads every tab's cards. Leaves the sheet open. */
export async function readCards(page: Page): Promise<Card[]> {
  await page.locator('#dock-build').click();
  await page.locator('#sheet .build-row').first().waitFor();
  // One pass over the sheet's DOM, tab by tab: the same text a player reads by scrolling each tab.
  return page.evaluate(() => {
    const out: { name: string; locked: boolean; owned: number }[] = [];
    const tabs = [...document.querySelectorAll<HTMLElement>('#sheet .build-tabs .tab')];
    for (const tab of tabs.length ? tabs : [null]) {
      tab?.click();
      for (const row of document.querySelectorAll('#sheet .build-row')) {
        const strong = row.querySelector('.card-title strong')!.cloneNode(true) as HTMLElement;
        strong.querySelector('.new-tag')?.remove();
        const tag = row.querySelector('.owned')?.textContent ?? '';
        out.push({
          name: (strong.textContent ?? '').replace(/\s+/g, ' ').trim(),
          locked: row.querySelector('.card-btn')?.getAttribute('aria-disabled') === 'true',
          owned: Number(/×(\d+)/.exec(tag)?.[1] ?? 0),
        });
      }
    }
    return out;
  });
}

/** Text only: what to do next, given what is on screen. Pure, so it is unit-tested. */
export function decide(screen: Screen, cards: Card[]): Action {
  const all = [screen.goal, ...screen.rows];
  if (all.some((x) => x.includes(t('goal.short.sk')))) return { kind: 'sk', why: 'the goal line says accept your SK' };
  if (!screen.goal && !screen.rows.length) return { kind: 'cant-tell', why: 'no goal on screen' };
  const waitTail = t('goal.short.wait', { name: '' }).trim();
  if (screen.goal.includes(waitTail)) return { kind: 'wait', why: 'the goal line says a building opens soon' };
  // A building named on screen that the player can build now and does not own yet. The goal line comes first, then the
  // next step and combo pieces, then the ★ lines and their how-to line, in the order they print.
  const order = names();
  const seen: string[] = [];
  for (const part of all) {
    const found: { at: number; name: string }[] = [];
    let rest = part;
    for (const name of order) {
      const at = rest.indexOf(name);
      if (at >= 0) {
        found.push({ at, name });
        rest = rest.replace(name, ' '.repeat(name.length));
      }
    }
    for (const f of found.sort((a, b) => a.at - b.at)) if (!seen.includes(f.name)) seen.push(f.name);
  }
  const byName = new Map(cards.map((c) => [c.name, c]));
  for (const name of seen) {
    const c = byName.get(name);
    if (c && !c.locked && c.owned === 0) return { kind: 'build', name, why: `named on screen: ${name}` };
  }
  // Every named building is already owned. A line that still asks for more (residents, combos) means build another.
  for (const name of seen) {
    const c = byName.get(name);
    if (c && !c.locked) return { kind: 'build', name, why: `named on screen, own ${c.owned} and the star still waits: ${name}` };
  }
  if (seen.length) return { kind: 'wait', why: `named on screen but not buildable now: ${seen.join(', ')}` };
  return { kind: 'cant-tell', why: 'no building named on screen' };
}

/** Taps the map in rings round its middle until the placement bar's Place button turns on, then taps it. */
async function placeOnMap(page: Page): Promise<boolean> {
  const box = (await page.locator('#map').boundingBox())!;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const ok = page.locator('#place-ok');
  const step = 28;
  const spots: [number, number][] = [];
  for (let dy = -Math.floor(box.height / 2 / step) + 1; dy < box.height / 2 / step; dy++)
    for (let dx = -Math.floor(box.width / 2 / step) + 1; dx < box.width / 2 / step; dx++) spots.push([dx * step, dy * step]);
  spots.sort((a, b) => a[0] ** 2 + a[1] ** 2 - (b[0] ** 2 + b[1] ** 2));
  for (const [dx, dy] of spots.slice(0, 160)) {
    await page.mouse.click(cx + dx, cy + dy);
    if (await ok.isEnabled()) {
      await ok.click();
      return true;
    }
  }
  await page.locator('#place-exit').click().catch(() => undefined);
  return false;
}

/** Does it by tapping. Returns false when the tap path failed (for example, no free spot on screen). */
export async function act(page: Page, action: Action): Promise<boolean> {
  if (action.kind === 'build') {
    const tabs = page.locator('#sheet .build-tabs .tab');
    for (let i = 0; i < Math.max(await tabs.count(), 1); i++) {
      if (await tabs.count()) await tabs.nth(i).click();
      const card = page.locator('#sheet .build-row', { has: page.locator('.card-title strong', { hasText: action.name }) }).locator('.card-btn');
      if (await card.count()) {
        await card.first().click();
        return placeOnMap(page);
      }
    }
    return false;
  }
  if (action.kind === 'sk') {
    await closeSheet(page);
    await page.locator('#goal-now').click();
    await page.locator('#modal .btn-primary').first().click({ timeout: 3000 }).catch(() => undefined);
    return true;
  }
  return true;
}

/** Closes the open sheet with its ✕, as a player would. */
export async function closeSheet(page: Page): Promise<void> {
  if (await page.locator('#sheet').isVisible()) await page.locator('#sheet .sheet-head .btn-icon').click();
}

/** Dismisses a popup or event card the way a player would: the first answer, or a tap on the dim corner. */
export async function dismissPopup(page: Page): Promise<string | null> {
  const modal = page.locator('#modal');
  if (!(await modal.isVisible())) return null;
  const title = ((await modal.locator('h2').first().textContent({ timeout: 1000 }).catch(() => '')) ?? '').trim();
  if (await modal.locator('.card.event').isVisible()) await modal.locator('.card.event .btn').first().click({ timeout: 5000 });
  else await modal.click({ position: { x: 8, y: 8 }, timeout: 5000 });
  return title || 'popup';
}
