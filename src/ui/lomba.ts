// Lomba Agustusan: the prep panel (contests, stage, ketua panitia) and the day itself, a full screen of short
// mini-games that cannot be closed in one tap.
import { t, type Key } from '../i18n';
import type { App } from '../app';
import { rupiah } from '../format';
import { inemURL } from '../render/inem';
import { audio } from '../audio';
import { BANNER, POLE, bannerURL, poleURL } from '../render/agustus';
import { CONTESTS, LOMBA, STAGES_17, type ContestDef } from '../data/lomba';
import {
  checkContest, climbBand, contestDef, finishLomba, ketua, lombaPrep, mashTaps, monthsToDay, rollContest, rollChance, setKetua, setStage, toggleContest,
  turnout, type LombaResult,
} from '../sim/lomba';
import { price } from '../sim/state';
import { h } from './dom';
import { openSheet } from './sheet';

const cTitle = (c: ContestDef) => t(`lomba.c.${c.id}` as Key);
const cBlurb = (c: ContestDef) => t(`lomba.c.${c.id}.blurb` as Key);
const pct = (x: number) => `${Math.round(x * 100)}%`;

// ---------- prep ----------

/** The panitia's panel: up to three contests, a stage and a ketua. Everything can be changed until the day. */
export function openLomba(app: App): void {
  const s = app.s;
  const l = lombaPrep(s);
  if (!l) {
    openSheet(t('lomba.title'), [h('p', { class: 'meta' }, t('lomba.closedBody'))]);
    return;
  }
  const redo = () => {
    app.tap(10);
    app.save();
    app.refresh();
    openLomba(app);
  };
  const contests = CONTESTS.map((c) => {
    const on = l.contests.includes(c.id);
    const why = on ? null : checkContest(s, c.id);
    const game = t(`lomba.game.${c.game}` as Key);
    return h('div', { class: `card-btn static lomba-contest${on ? ' on' : ''}`, 'data-contest': c.id },
      h('div', { class: 'card-text' },
        h('div', { class: 'card-title' }, h('strong', {}, cTitle(c)), h('span', { class: 'meta' }, game)),
        h('p', {}, cBlurb(c)),
        h('p', { class: 'meta' }, t('lomba.prize', { viral: c.prize.viral, sabar: c.prize.sabar, amt: rupiah(price(s, c.prize.rupiah)) })),
        h('button', { class: `btn ${on ? '' : 'btn-primary'}`, 'aria-pressed': String(on), disabled: !!why, onclick: () => { toggleContest(s, c.id); redo(); } },
          on ? t('lomba.drop', { amt: rupiah(price(s, c.cost)) }) : t('lomba.pick', { amt: rupiah(price(s, c.cost)) })),
        why ? h('p', { class: 'meta warn' }, why) : null,
      ),
    );
  });
  const stages = h('div', { class: 'row lomba-stages' }, ...STAGES_17.map((st, i) =>
    h('button', { class: `btn ${l.stage === i ? 'btn-primary' : ''}`, 'data-stage': st.id, 'aria-pressed': String(l.stage === i), onclick: () => {
      const why = setStage(s, i);
      if (why) app.notice({ title: t('lomba.title'), body: why, tone: 'bad' });
      redo();
    } }, h('span', {}, t(`lomba.stage.${st.id}` as Key)), st.cost ? h('span', { class: 'price' }, rupiah(price(s, st.cost))) : null),
  ));
  const staff = s.staff ?? [];
  const k = ketua(s);
  const ketuas = h('div', { class: 'row lomba-ketua' },
    h('button', { class: `btn ${!k ? 'btn-primary' : ''}`, 'aria-pressed': String(!k), 'data-ketua': 'none', onclick: () => { setKetua(s, undefined); redo(); } }, t('lomba.noKetua')),
    ...staff.map((x) => h('button', { class: `btn ${k?.id === x.id ? 'btn-primary' : ''}`, 'aria-pressed': String(k?.id === x.id), 'data-ketua': String(x.id), onclick: () => { setKetua(s, x.id); redo(); } },
      h('span', {}, x.name), h('span', { class: 'meta' }, t('lomba.ketuaStats', { rajin: x.stats.rajin, gaul: x.stats.gaul })))),
  );
  openSheet(t('lomba.title'), [
    h('p', { class: 'meta lomba-when' }, t('lomba.when', { n: monthsToDay(s) })),
    h('p', { class: 'meta' }, t('lomba.intro', { n: LOMBA.maxContests })),
    h('h3', {}, t('lomba.contests', { n: l.contests.length, max: LOMBA.maxContests })),
    ...contests,
    h('h3', {}, t('lomba.stageHead')),
    h('p', { class: 'meta' }, t('lomba.stageHelp')),
    stages,
    h('h3', {}, t('lomba.ketuaHead')),
    h('p', { class: 'meta' }, t('lomba.ketuaHelp')),
    ketuas,
    h('h3', {}, t('lomba.odds')),
    h('p', { class: 'meta lomba-odds' }, t('lomba.oddsLine', { band: pct(climbBand(s)), taps: mashTaps(s), roll: pct(rollChance(s)), turnout: turnout(s).toFixed(1) })),
  ]);
}

// ---------- the day ----------

let dayOpen = false;
export const lombaDayOpen = (): boolean => dayOpen;

/** 17 Agustus: one contest at a time, then the prizes. Each step needs a tap of its own, so it cannot be waved away. */
export function openLombaDay(app: App): void {
  const s = app.s;
  const l = s.lomba;
  if (!l?.due || dayOpen) return;
  dayOpen = true;
  app.held = true;
  const root = h('div', { id: 'lomba-day', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'lomba-day-title' });
  document.body.append(root);
  const won: Record<string, boolean> = {};
  const queue = [...l.contests];
  const page = (...kids: (Node | null)[]) => root.replaceChildren(h('div', { class: 'lomba-page' }, ...kids));
  const title = (text: string) => h('h1', { id: 'lomba-day-title' }, text);

  const banner = () => h('img', { class: 'pixel lomba-banner', src: bannerURL(), alt: '', width: BANNER.w * 4, height: BANNER.h * 4 });
  const intro = () => page(
    banner(),
    title(t('lomba.dayTitle')),
    h('p', {}, t('lomba.dayBody', { turnout: turnout(s).toFixed(1) })),
    STAGES_17[l.stage].inem ? h('div', { class: 'inem-head' }, h('img', { src: inemURL(), alt: '', width: 88, height: 120, class: 'pixel inem-face' }), h('span', { class: 'inem-name' }, t('inem.name'))) : null,
    STAGES_17[l.stage].inem ? h('p', {}, t('lomba.inemOpens')) : null,
    h('button', { class: 'btn btn-primary lomba-go', onclick: () => { app.tap(10); next(); } }, t('lomba.start')),
  );

  const next = () => {
    const id = queue.shift();
    if (!id) return done();
    const c = contestDef(id);
    if (c.game === 'climb') climb(c);
    else if (c.game === 'mash') mash(c);
    else roll(c);
  };

  const outcome = (c: ContestDef, win: boolean) => {
    won[c.id] = win;
    if (c.game === 'climb') audio.play(win ? 'slideUp' : 'slideDown');
    else audio.play(win ? 'cheer' : 'koplo');
    if (c.game === 'climb' && win) window.setTimeout(() => audio.play('cheer'), 450);
    page(
      title(cTitle(c)),
      h('p', { class: `lomba-outcome ${win ? 'win' : 'lose'}` }, t(win ? 'lomba.win' : 'lomba.lose')),
      h('button', { class: 'btn btn-primary lomba-go', onclick: () => { app.tap(10); next(); } }, t(queue.length ? 'lomba.next' : 'lomba.toPrizes')),
    );
  };

  /** Panjat Pinang: the grip marker slides up and down the pole; tap while it is in the green band. */
  const climb = (c: ContestDef) => {
    const band = climbBand(s);
    let lo = 0;
    let grips = 0;
    let misses = 0;
    const place = () => { lo = 0.1 + Math.random() * (0.8 - band); };
    place();
    const zone = h('div', { class: 'lomba-zone' });
    const marker = h('div', { class: 'lomba-marker' });
    const pole = h('div', { class: 'lomba-pole', 'aria-hidden': 'true' }, zone, marker);
    pole.style.backgroundImage = `url(${poleURL()})`;
    pole.style.width = `${POLE.w * 4}px`;
    pole.style.height = `${POLE.h * 4}px`;
    const count = h('p', { class: 'meta lomba-count', 'aria-live': 'polite' });
    const btn = h('button', { class: 'btn btn-primary lomba-tap', id: 'lomba-climb' }, t('lomba.climbBtn'));
    const paint = (pos: number) => {
      zone.style.bottom = pct(lo);
      zone.style.height = pct(band);
      marker.style.bottom = `calc(${pct(pos)} - 4px)`;
      btn.dataset.pos = pos.toFixed(3);
      btn.dataset.lo = lo.toFixed(3);
      btn.dataset.hi = (lo + band).toFixed(3);
      count.textContent = t('lomba.climbCount', { grips, need: LOMBA.climbGrips, misses, max: LOMBA.climbMisses });
    };
    const start = performance.now();
    // Slower with reduce motion, so the timing stays fair without fast movement.
    const period = app.settings.reduceMotion ? 3600 : 1800;
    let pos = 0;
    let raf = 0;
    const loop = (now: number) => {
      const k = ((now - start) % period) / period;
      pos = k < 0.5 ? k * 2 : 2 - k * 2;
      paint(pos);
      raf = requestAnimationFrame(loop);
    };
    btn.onclick = () => {
      if (pos >= lo && pos <= lo + band) {
        grips++;
        app.tap(15);
        place();
      } else misses++;
      paint(pos);
      if (grips >= LOMBA.climbGrips || misses >= LOMBA.climbMisses) {
        cancelAnimationFrame(raf);
        outcome(c, grips >= LOMBA.climbGrips);
      }
    };
    page(title(cTitle(c)), h('p', {}, t('lomba.climbHow')), h('div', { class: 'lomba-arena' }, pole, h('div', { class: 'lomba-side' }, count, btn)));
    raf = requestAnimationFrame(loop);
  };

  /** Balap Karung: tap as fast as you can until the time runs out. */
  const mash = (c: ContestDef) => {
    const need = mashTaps(s);
    let taps = 0;
    let started = 0;
    const bar = h('div', { class: 'lomba-bar' }, h('div', {}));
    const info = h('p', { class: 'meta lomba-count', 'aria-live': 'polite' }, t('lomba.mashReady', { n: need, sec: LOMBA.mashSeconds }));
    const btn = h('button', { class: 'btn btn-primary lomba-tap', id: 'lomba-mash' }, t('lomba.mashBtn'));
    const stop = () => {
      btn.disabled = true;
      outcome(c, taps >= need);
    };
    btn.onclick = () => {
      if (!started) {
        started = performance.now();
        window.setTimeout(stop, LOMBA.mashSeconds * 1000);
      }
      taps++;
      audio.play('hop');
      (bar.firstChild as HTMLElement).style.width = pct(Math.min(1, taps / need));
      info.textContent = t('lomba.mashCount', { n: taps, need });
    };
    page(title(cTitle(c)), h('p', {}, t('lomba.mashHow', { sec: LOMBA.mashSeconds })), bar, info, btn);
  };

  /** Makan Kerupuk and Tarik Tambang: the odds decide, shown with the chance beforehand. */
  const roll = (c: ContestDef) => {
    page(
      title(cTitle(c)),
      h('p', {}, cBlurb(c)),
      h('p', { class: 'meta' }, t('lomba.rollOdds', { pct: pct(rollChance(s)) })),
      h('button', { class: 'btn btn-primary lomba-go', id: 'lomba-roll', onclick: () => {
        app.tap(10);
        if (c.id === 'makanKerupuk') audio.play('crunch');
        outcome(c, rollContest(s));
      } }, t('lomba.rollBtn')),
    );
  };

  const done = () => {
    const fx: Parameters<typeof finishLomba>[2] = [];
    const r: LombaResult = finishLomba(s, won, fx);
    if (r.trophy) audio.play('drumband');
    else if (r.wins.length) audio.play('angklung');
    app.handleFx(fx);
    app.save();
    app.refresh();
    page(
      banner(),
      title(t('lomba.prizesTitle')),
      h('p', {}, r.wins.length ? t('lomba.prizesBody', { n: r.wins.length, of: l.contests.length }) : t('lomba.prizesNone')),
      r.wins.length ? h('p', { class: 'lomba-prizes' }, t('lomba.prizesLine', { viral: r.viral, sabar: r.sabar, amt: rupiah(r.rupiah) })) : null,
      r.trophy ? h('p', { class: 'lomba-trophy' }, t('lomba.trophy')) : null,
      r.ricuh ? h('p', { class: 'meta warn' }, t('lomba.ricuh', { n: LOMBA.ricuhSabar })) : null,
      h('button', { class: 'btn btn-primary lomba-go', id: 'lomba-done', onclick: close }, t('lomba.done')),
    );
  };

  const close = () => {
    root.remove();
    dayOpen = false;
    app.held = false;
    app.tap(10);
  };

  intro();
  audio.play('drumband');
}
