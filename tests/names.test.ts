import { describe, expect, it } from 'vitest';
import { FEMALE_NAMES, isFemaleName, MALE_NAMES, UNISEX_NAMES } from '../src/data/names';
import { staffLook } from '../src/render/portraits';
import { deserialize, serialize } from '../src/sim/save';
import { addResident, newGame } from '../src/sim/state';
import { ensureStaff, rollApplicants } from '../src/sim/staff';

/** A name fits its title: Bu and Mbak take a woman's or a unisex name, Pak and Mas a man's or a unisex one. */
const fits = (name: string) => {
  const given = name.split(' ')[1];
  return UNISEX_NAMES.includes(given) || (isFemaleName(name) ? FEMALE_NAMES : MALE_NAMES).includes(given);
};

describe('titles fit names and hair', () => {
  it('no name is on both lists', () => {
    for (const n of MALE_NAMES) expect(FEMALE_NAMES, n).not.toContain(n);
  });

  it('every new resident and applicant has a title that fits their name', () => {
    const s = newGame(7);
    for (let i = 0; i < 200; i++) expect(fits(addResident(s).name)).toBe(true);
    s.lowongan = { role: 'hansip', channel: 'online', applicants: [], wait: 0 } as never;
    for (let m = 0; m < 60; m++) {
      s.month = m;
      for (const a of rollApplicants(s)) if (!a.special) expect(fits(a.name), a.name).toBe(true);
    }
  });

  it('Pak and Mas wear short hair; Bu and Mbak long hair, a bun or a ponytail, and never a peci', () => {
    for (const role of ['hansip', 'pu', 'supir', 'bendahara', 'adminWa', 'asisten', 'sekretaris', 'penagih', 'satpol'])
      for (let id = 1; id <= 40; id++) {
        expect(['short', 'side', 'curly', 'grey', 'bald'], `${role} ${id} m`).toContain(staffLook(role, id).hair);
        const f = staffLook(role, id, true);
        expect(['long', 'bun', 'ponytail'], `${role} ${id} f`).toContain(f.hair);
        expect(f.props, `${role} ${id} f`).not.toContain('peci');
      }
  });

  it('an old save turns the title to fit the name, and keeps the name', () => {
    const s = newGame(3);
    ensureStaff(s);
    s.residents.push({ id: 900, name: 'Pak Yanti', job: 'none', pensiun: 0, fake: 0, arrived: 0 } as never);
    s.residents.push({ id: 901, name: 'Mbak Joko', job: 'none', pensiun: 0, fake: 0, arrived: 0 } as never);
    s.residents.push({ id: 902, name: 'Mas Dian', job: 'none', pensiun: 0, fake: 0, arrived: 0 } as never);
    s.staff!.push({ id: 77, name: 'Pak Oki', role: 'hansip', stars: 3, stats: { rajin: 50, lobi: 50, jujur: 50, gaul: 50 }, salary: 1, xp: 0, level: 1, hiredAt: 0 });
    s.staff!.push({ id: 78, name: 'Pak Rina', role: 'pu', stars: 3, stats: { rajin: 50, lobi: 50, jujur: 50, gaul: 50 }, salary: 1, xp: 0, level: 1, hiredAt: 0 });
    const t = deserialize(serialize(s))!;
    expect(t.residents.slice(-3).map((r) => r.name)).toEqual(['Bu Yanti', 'Mas Joko', 'Mas Dian']);
    expect(t.staff!.slice(-2).map((x) => x.name)).toEqual(['Pak Oki', 'Bu Rina']);
    expect(t.staff!.find((x) => x.inem)!.name).toBe(s.staff!.find((x) => x.inem)!.name);
  });
});
