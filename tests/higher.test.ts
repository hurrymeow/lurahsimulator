import { describe, expect, it } from 'vitest';
import { BUILDINGS } from '../src/data/buildings';
import { COMBOS } from '../src/data/combos';
import { EVENTS } from '../src/data/events';
import {
  HIGHER_STAGES,
  PATH_UNLOCKS,
  PROMOTION_UNLOCKS,
  STAGE_BUILDINGS,
  STAGE_COMBOS,
  STAGE_EVENTS,
  STAGE_JOBS,
  STAGE_METERS,
} from '../src/data/higher';
import { JOBS } from '../src/data/jobs';
import { STAGES } from '../src/data/stages';
import { HIGHER_ART } from '../src/render/art-higher';
import { ID_HIGHER_DATA } from '../src/i18n/higher-id';
import { nextStarChecklist } from '../src/sim/stages';
import { newGame } from '../src/sim/state';

// Ids that RT-stage content adds in another change. Remove each once it lands in BUILDINGS.
const PENDING_RT: string[] = [];

const buildingIds = new Set([...BUILDINGS.map((b) => b.id), ...STAGE_BUILDINGS.map((b) => b.id), ...PENDING_RT]);

describe('RW and Kelurahan content', () => {
  it('has unique ids that do not collide with the RT content', () => {
    for (const [list, base] of [
      [STAGE_BUILDINGS, BUILDINGS],
      [STAGE_COMBOS, COMBOS],
      [STAGE_JOBS, JOBS],
      [STAGE_EVENTS, EVENTS],
    ] as const) {
      const ids = list.map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(base.some((b) => b.id === id), id).toBe(false);
    }
  });

  it('draws every building and makes each one move a number', () => {
    for (const b of STAGE_BUILDINGS) {
      expect(HIGHER_ART[b.sprite], b.id).toBeTypeOf('function');
      expect(b.income || b.perMonth || b.fx || b.jobSlots || b.requires, b.id).toBeTruthy();
    }
  });

  it('only combos with buildings that exist', () => {
    for (const c of STAGE_COMBOS) for (const id of c.needs) expect(buildingIds.has(id) || id === 'parkir', `${c.id}:${id}`).toBe(true);
  });

  it('keeps the first choice of every event free', () => {
    for (const e of STAGE_EVENTS) {
      expect(e.choices[0].cost, e.id).toBeUndefined();
      expect(e.choices.length, e.id).toBeGreaterThan(1);
    }
  });

  it('opens every gated building from a star or promotion', () => {
    const opened = new Set<string>(Object.values(PROMOTION_UNLOCKS).flat());
    for (const st of HIGHER_STAGES) st.stars.forEach((s) => s.unlocks.forEach((id) => opened.add(id)));
    for (const p of Object.values(PATH_UNLOCKS)) [p.start, ...p.stars].flat().forEach((id) => opened.add(id));
    for (const b of STAGE_BUILDINGS) expect(opened.has(b.id), b.id).toBe(true);
    for (const id of opened) expect(buildingIds.has(id), id).toBe(true);
  });

  it('puts every RW and Kelurahan stage into STAGES', () => {
    for (const st of HIGHER_STAGES) expect(STAGES).toContain(st);
    expect(STAGES.find((s) => s.id === 'rt')!.next).toBe('rw');
    expect(STAGES.find((s) => s.id === 'rw')!.next).toBe('kelurahan');
  });

  it('translates every field into Indonesian, with no strays', () => {
    const want = new Set<string>();
    for (const m of STAGE_METERS) want.add(`meter.${m.id}.blurb`);
    for (const b of STAGE_BUILDINGS) {
      want.add(`building.${b.id}.blurb`);
      if (b.removeBlockedReason) want.add(`building.${b.id}.block`);
    }
    for (const c of STAGE_COMBOS) ['hint', 'story', 'effect'].forEach((f) => want.add(`combo.${c.id}.${f}`));
    for (const j of STAGE_JOBS) want.add(`job.${j.id}.blurb`);
    for (const e of STAGE_EVENTS) {
      want.add(`event.${e.id}.name`);
      want.add(`event.${e.id}.body`);
      e.choices.forEach((c, i) => {
        want.add(`event.${e.id}.c${i}.label`);
        if (c.result) want.add(`event.${e.id}.c${i}.result`);
        if (c.modifier) want.add(`event.${e.id}.c${i}.mod`);
        c.outcomes?.forEach((_o, j) => want.add(`event.${e.id}.c${i}.o${j}.result`));
      });
    }
    for (const k of want) expect(ID_HIGHER_DATA[k], k).toBeTruthy();
    // Combo names are the only extra `.name` keys, kept for the Buku Combo.
    const strays = Object.keys(ID_HIGHER_DATA).filter((k) => !want.has(k) && !/^combo\.\w+\.name$/.test(k));
    expect(strays).toEqual([]);
  });

  it('keeps satire on systems: no real names or flagship programs', () => {
    const text = JSON.stringify([STAGE_BUILDINGS, STAGE_COMBOS, STAGE_JOBS, STAGE_EVENTS, STAGE_METERS, ID_HIGHER_DATA]).toLowerCase();
    for (const bad of ['jokowi', 'prabowo', 'megawati', 'gibran', 'ahok', 'anies', 'golkar', 'pdip', 'gerindra', 'nasdem', 'blusukan', 'ikn', 'ibu kota']) {
      expect(text.includes(bad), bad).toBe(false);
    }
  });

  it('prints the RW checklist and says exactly what is missing', () => {
    const s = newGame(1);
    s.stage.current = 'rw';
    const lines = nextStarChecklist(s)!.map((l) => l.text);
    expect(lines).toEqual(['Fund 3 neighbouring RTs once (have 0)', 'Stempel backlog under 5 for 6 weeks (have 0)']);
    s.stage.stars.rw = 2;
    expect(nextStarChecklist(s)!.map((l) => l.text)[1]).toBe('2 RTs at 3★ or above (have 0)');
  });
});
