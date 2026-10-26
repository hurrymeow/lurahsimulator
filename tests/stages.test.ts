import { describe, expect, it } from 'vitest';
import { deserialize, serialize } from '../src/sim/save';
import { newGame } from '../src/sim/state';
import { nextStarChecklist, starsEarnable } from '../src/sim/stages';

describe('stage checklist', () => {
  it('starts at 0 stars and names exactly what is missing', () => {
    const s = newGame(1);
    expect(s.stage).toEqual({ current: 'rt', stars: { rt: 0, rw: 0, kelurahan: 0 } });
    const lines = nextStarChecklist(s)!;
    expect(lines.map((l) => l.text)).toEqual(['12 residents (have 4)', '1 combos found (have 0)']);
    expect(starsEarnable(s)).toBe(false);
  });

  it('ticks lines off as the goals are met', () => {
    const s = newGame(1);
    s.discovered.push('tongkrongan');
    s.residents.push(...Array.from({ length: 8 }, (_, i) => ({ ...s.residents[0], id: 100 + i })));
    expect(nextStarChecklist(s)!.every((l) => l.done)).toBe(true);
    expect(starsEarnable(s)).toBe(true);
  });

  it('counts a win streak from the latest year', () => {
    const s = newGame(1);
    s.stage.stars.rt = 2;
    s.ranking = [true, false, true, true].map((won, i) => ({ year: i + 1, us: 1, them: 1, won }));
    const streak = nextStarChecklist(s)!.find((l) => l.goal.kind === 'winStreak')!;
    expect(streak.done).toBe(true);
  });

  it('is null at 3 stars', () => {
    const s = newGame(1);
    s.stage.stars.rt = 3;
    expect(nextStarChecklist(s)).toBeNull();
  });

  it('fills the stage into saves from before stages', () => {
    const s = newGame(1) as Partial<ReturnType<typeof newGame>>;
    delete s.stage;
    expect(deserialize(serialize(s as never))!.stage.current).toBe('rt');
  });
});
