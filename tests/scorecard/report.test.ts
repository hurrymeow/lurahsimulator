import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BOTS, type BotId } from './driver';
import { CACHE, readCache } from './plan';
import { buildScorecard, renderMarkdown, sourceText, trendOf, type Runs, type Takeover, type Trend } from './scorecard';

describe.skipIf(!process.env.SCORECARD)('scorecard report', () => {
  it('writes scorecard/scorecard.md and golden-trend.json with no blank rows', () => {
    const runs: Runs = {};
    for (const bot of BOTS as BotId[]) runs[bot] = readCache(bot);
    const takeovers: Takeover[] = JSON.parse(readFileSync(`${CACHE}/takeover.json`, 'utf8'));
    const rows = buildScorecard(runs, takeovers, sourceText());
    expect(rows.map((r) => r.n)).toEqual(Array.from({ length: 27 }, (_, i) => i + 1));
    for (const r of rows) expect(r.evidence.length, `row ${r.n}`).toBeGreaterThan(10);
    const generated = new Date().toISOString().slice(0, 10);
    const trendFile = 'scorecard/golden-trend.json';
    const previous: Trend | undefined = existsSync(trendFile) ? JSON.parse(readFileSync(trendFile, 'utf8')) : undefined;
    mkdirSync('scorecard', { recursive: true });
    writeFileSync('scorecard/scorecard.md', renderMarkdown(runs, rows, takeovers, generated, previous));
    writeFileSync(trendFile, JSON.stringify(trendOf(runs, rows, generated), null, 2) + '\n');
  });
});
