import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// TESTING.md item 1: the sim takes its seed from the caller. Wall-clock time and Math.random would make a game unreplayable.
const BANNED = [/\bMath\.random\b/, /\bDate\.now\b/, /\bperformance\.now\b/, /\bnew Date\b/];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : p.endsWith('.ts') ? [p] : [];
  });
}

describe('src/sim is deterministic', () => {
  it('uses no wall clock and no Math.random', () => {
    const hits = files('src/sim').flatMap((f) =>
      readFileSync(f, 'utf8').split('\n').flatMap((line, i) => (BANNED.some((re) => re.test(line.replace(/\/\/.*$/, ''))) ? [`${f}:${i + 1}: ${line.trim()}`] : [])),
    );
    expect(hits).toEqual([]);
  });
});
