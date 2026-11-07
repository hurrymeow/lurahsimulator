"""Mars Pak Pejabat: the background music loop. Original composition.

A style tour of Indonesian official and campaign jingles, 1960s-2010s, in one 84-bar
loop at 112 bpm (3:00). No song is quoted; see decisions/mars-pak-pejabat.md.

  python3 scripts/music/compose.py            writes src/music-score.ts and docs/music/mars-pak-pejabat.mid
  python3 scripts/music/compose.py --preview DIR   also renders DIR/mars-pak-pejabat.wav (needs numpy)
"""
import os, struct, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BPM = 112
PPQ = 480
SR = 44100
SPB = 60 / BPM  # seconds per beat

# ---------- chords ----------
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}

def chord(name):
    r = NOTE[name[0]]
    i = 1
    if i < len(name) and name[i] in '#b':
        r += 1 if name[i] == '#' else -1
        i += 1
    q = name[i:]
    tones = {'': [0, 4, 7], 'm': [0, 3, 7], '7': [0, 4, 7, 10]}[q]
    return r % 12, tones

def voicing(name, lo):
    """Chord tones placed at or above midi `lo`, closest stacked."""
    r, tones = chord(name)
    out = []
    for t in tones:
        p = lo + ((r + t - lo) % 12)
        out.append(p)
    return sorted(out)

def bass_note(name, lo=36):
    r, _ = chord(name)
    return lo + ((r - lo) % 12)

# ---------- score ----------
# events: (channel, start_beat, dur_beats, pitch, velocity)
ev = []
programs = {}
marks = []  # (beat, text)

def prog(ch, p):
    programs[ch] = p

def mel(ch, bar0, bars, vel=96, octave=0, legato=0.92):
    t = bar0 * 4
    for bar in bars:
        assert abs(sum(d for _, d in bar) - 4) < 1e-6, bar
        for p, d in bar:
            if p:
                ev.append((ch, t, d * legato, p + 12 * octave, vel))
            t += d

DR = 9
KICK, SNARE, RIM, CLAP, CHH, OHH, CRASH, RIDE = 36, 38, 37, 39, 42, 46, 49, 51
HBONGO, LBONGO, MHCONGA, OHCONGA, LCONGA, TAMB = 60, 61, 62, 63, 64, 54

def hit(t, n, v=90, d=0.25):
    ev.append((DR, t, d, n, v))

prog(0, 56)   # trumpet - lead brass
prog(1, 57)   # trombone - off-beat chords
prog(2, 58)   # tuba
prog(3, 9)    # glockenspiel (drumband)
prog(4, 48)   # strings
prog(5, 73)   # flute / suling
prog(6, 62)   # synth brass (80s-90s ad jingle)
prog(7, 4)    # electric piano
prog(8, 33)   # electric bass
prog(10, 24)  # nylon guitar (cak/cuk, koplo strum)
prog(11, 45)  # pizzicato (keroncong cello)
prog(12, 60)  # french horn (news theme)
prog(13, 47)  # timpani
prog(14, 22)  # harmonica ~ pianika

def march_backing(bar0, chords, cymbal_every=4, glock=None):
    for i, c in enumerate(chords):
        t = (bar0 + i) * 4
        b = bass_note(c, 34)
        ev.append((2, t, 0.8, b, 100))
        ev.append((2, t + 2, 0.8, b + 7 if b + 7 < 48 else b - 5, 92))
        for k in (1, 3):
            for p in voicing(c, 53):
                ev.append((1, t + k, 0.45, p, 70))
        # drumband: bass drum 1&3, snare march figure
        hit(t, KICK, 105); hit(t + 2, KICK, 95)
        for s, v in ((1, 80), (1.5, 60), (1.75, 64), (3, 84), (3.5, 60), (3.75, 66)):
            hit(t + s, SNARE, v)
        if i % cymbal_every == 0:
            hit(t, CRASH, 80, 2)

def snare_roll(t, beats, v0=50, v1=110):
    n = int(beats * 8)
    for k in range(n):
        hit(t + k / 8, SNARE, int(v0 + (v1 - v0) * k / n), 0.12)

beat = 0
# ===== 1. Intro fanfare - upacara bendera feel (4 bars, F) =====
marks.append((0, 'loopStart'))
marks.append((0, 'Intro: upacara fanfare'))
T3 = 1 / 3
fan = [
    [(72, T3), (72, T3), (72, T3), (77, 1), (72, 1), (77, 1)],
    [(81, 2), (79, 1), (77, 1)],
    [(76, 1), (77, 1), (79, 1), (76, 1)],
    [(77, 3), (0, 1)],
]
mel(0, 0, fan, 108)
mel(3, 0, fan, 70, octave=1)
for i, c in enumerate(['F', 'F', 'C7', 'F']):
    t = i * 4
    for p in voicing(c, 53):
        ev.append((1, t, 1.8 if i < 3 else 2.8, p, 80))
    ev.append((2, t, 1.8, bass_note(c, 34), 100))
    ev.append((13, t, 0.5, bass_note(c, 41), 90))
hit(0, CRASH, 100, 3); hit(0, KICK, 110)
snare_roll(8, 4, 40, 100)
hit(12, CRASH, 105, 3); hit(12, KICK, 110)

# ===== 2. Mars pembangunan - 60s/70s march (16 bars, F) =====
B = 4
marks.append((B * 4, 'A: mars pembangunan (1960s-70s)'))
march = [
    [(72, 1.5), (69, .5), (72, 1), (77, 1)],
    [(76, .5), (74, .5), (72, 1), (69, 2)],
    [(70, 1), (72, .5), (74, .5), (76, 1), (79, 1)],
    [(77, 3), (0, 1)],
    [(74, 1.5), (70, .5), (74, 1), (77, 1)],
    [(76, 1), (72, 1), (69, 2)],
    [(67, 1), (69, .5), (70, .5), (72, 1), (67, 1)],
    [(65, 3), (0, 1)],
    [(69, .5), (72, .5), (77, 1), (77, 1), (76, .5), (74, .5)],
    [(72, 1), (69, 1), (72, 2)],
    [(70, 1), (74, 1), (77, 1), (74, 1)],
    [(79, 1.5), (77, .5), (74, 2)],
    [(72, 1), (77, 1), (81, 1.5), (79, .5)],
    [(77, 1), (76, 1), (74, 1), (72, 1)],
    [(70, 1), (74, 1), (72, 1), (76, 1)],
    [(77, 2), (72, 1), (0, 1)],
]
march_ch = ['F', 'F', 'C7', 'F', 'Bb', 'F', 'C7', 'F', 'F', 'F', 'Bb', 'Gm', 'F', 'Dm', 'C7', 'F']
mel(0, B, march, 100)
mel(3, B + 8, march[8:], 64, octave=1)
march_backing(B, march_ch)

# ===== 3. Berita / Kelompencapir - stately TV theme (8 bars, Bb -> A7) =====
B = 20
marks.append((B * 4, 'B: siaran berita TVRI (1970s-80s)'))
news = [
    [(74, 2), (72, 1), (70, 1)],
    [(67, 2), (70, 2)],
    [(75, 1.5), (74, .5), (72, 2)],
    [(72, 3), (0, 1)],
    [(77, 2), (75, 1), (74, 1)],
    [(74, 1), (72, 1), (70, 2)],
    [(72, 1), (75, 1), (79, 1), (77, 1)],
    [(76, 2), (73, 2)],
]
news_ch = ['Bb', 'Gm', 'Eb', 'F', 'Bb', 'Gm', 'Cm', 'A7']
mel(12, B, news, 92, legato=0.98)
mel(0, B + 4, news[4:], 70, legato=0.98)
for i, c in enumerate(news_ch):
    t = (B + i) * 4
    for p in voicing(c, 55):
        ev.append((4, t, 3.95, p, 62))
    ev.append((4, t, 3.95, bass_note(c, 43), 66))
    ev.append((2, t, 1.9, bass_note(c, 34), 84))
    ev.append((2, t + 2, 1.9, bass_note(c, 34), 72))
    ev.append((13, t, 0.6, bass_note(c, 41), 80))
    hit(t + 1, RIDE, 50); hit(t + 3, RIDE, 50)
    if i % 2 == 1:
        hit(t + 3.5, SNARE, 55); hit(t + 3.75, SNARE, 62)
hit(B * 4, CRASH, 85, 3)
snare_roll((B + 7) * 4 + 2, 2, 40, 105)

# ===== 4. Dangdut koplo kampanye - 2000s-2010s rally stage (16 bars, Dm) =====
B = 28
marks.append((B * 4, 'C: dangdut koplo kampanye (2000s-2010s)'))
koplo = [
    [(69, .5), (70, .5), (69, .5), (67, .5), (65, 1), (62, 1)],
    [(65, .5), (67, .5), (69, 1), (0, 1), (69, .5), (70, .5)],
    [(74, 1), (70, .5), (69, .5), (67, 2)],
    [(69, .5), (70, .5), (73, 1), (69, 2)],
    [(74, .5), (76, .5), (77, 1), (76, .5), (74, .5), (73, .5), (74, .5)],
    [(69, 2), (0, .5), (65, .5), (67, .5), (69, .5)],
    [(70, 1), (74, 1), (70, .5), (69, .5), (67, 1)],
    [(64, .5), (65, .5), (67, .5), (69, .5), (73, 1), (76, 1)],
    [(77, 1.5), (74, .5), (70, 2)],
    [(72, 1), (76, 1), (79, 1), (76, 1)],
    [(77, 1), (72, 1), (69, 2)],
    [(74, .5), (72, .5), (69, .5), (65, .5), (62, 2)],
    [(67, .5), (70, .5), (74, 1), (72, .5), (70, .5), (67, 1)],
    [(69, 1), (73, 1), (76, 1), (73, 1)],
    [(74, .5), (73, .5), (74, .5), (76, .5), (77, .5), (76, .5), (74, 1)],
    [(73, 1), (69, 1), (64, 1), (61, 1)],
]
koplo_ch = ['Dm', 'Dm', 'Gm', 'A7', 'Dm', 'Dm', 'Gm', 'A7',
            'Bb', 'C', 'F', 'Dm', 'Gm', 'A7', 'Dm', 'A7']
mel(5, B, koplo, 100, octave=1, legato=0.97)
mel(14, B + 8, koplo[8:], 60, legato=0.9)
for i, c in enumerate(koplo_ch):
    t = (B + i) * 4
    r = bass_note(c, 38)
    # dangdut bass: 1, &2, 3, &4 with octave pop
    for s, p, v in ((0, r, 100), (1.5, r, 84), (2, r + 12, 70), (2.5, r + 7, 84), (3.5, r, 80)):
        ev.append((8, t + s, 0.4, p, v))
    # guitar off-beat chop
    for s in (0.5, 1.5, 2.5, 3.5):
        for p in voicing(c, 57):
            ev.append((10, t + s, 0.2, p, 66))
    # kendang koplo: tak (open hi conga) / dhut (low conga) / tung (bongos)
    last = (i % 4 == 3)
    if not last:
        pat = [(0, LCONGA, 100), (0.75, OHCONGA, 80), (1, LCONGA, 90), (1.5, OHCONGA, 85),
               (2, LCONGA, 100), (2.5, HBONGO, 70), (2.75, OHCONGA, 85), (3, LCONGA, 85),
               (3.5, OHCONGA, 90)]
    else:  # fill on every 4th bar
        pat = [(0, LCONGA, 100), (0.5, OHCONGA, 85), (1, LCONGA, 90), (1.5, OHCONGA, 85)]
        for k in range(8):
            pat.append((2 + k * 0.25, [HBONGO, LBONGO, OHCONGA, MHCONGA][k % 4], 70 + k * 5))
    for s, n, v in pat:
        hit(t + s, n, v, 0.2)
    for k in range(8):
        hit(t + k / 2, TAMB, 55 if k % 2 else 70, 0.1)
    if i % 8 == 0:
        hit(t, CRASH, 85, 2)

# ===== 5. Jingle iklan - 80s/90s TV-ad pop (16 bars, D) =====
B = 44
marks.append((B * 4, 'D: jingle iklan pop (1980s-90s)'))
pop = [
    [(69, .5), (69, .5), (74, 1), (0, .5), (73, .5), (74, 1)],
    [(71, .5), (71, .5), (74, 1), (78, 1), (76, 1)],
    [(74, .5), (71, .5), (67, 1), (71, 1), (74, 1)],
    [(73, 2), (0, 1), (69, 1)],
    [(69, .5), (69, .5), (74, 1), (0, .5), (73, .5), (74, 1)],
    [(71, .5), (74, .5), (78, 1), (81, 1), (78, 1)],
    [(79, 1), (76, 1), (71, 1), (76, 1)],
    [(73, 1.5), (76, .5), (81, 2)],
    [(79, 1), (78, .5), (76, .5), (74, 1), (71, 1)],
    [(76, 1), (73, 1), (69, 2)],
    [(73, 1), (78, 1), (81, 1), (78, 1)],
    [(74, 1.5), (73, .5), (71, 2)],
    [(71, .5), (74, .5), (79, 1), (78, .5), (76, .5), (74, 1)],
    [(73, 1), (76, 1), (81, 1), (79, 1)],
    [(78, 1), (74, .5), (76, .5), (78, 1), (74, 1)],
    [(76, 1), (73, 1), (69, 1), (67, 1)],
]
pop_ch = ['D', 'Bm', 'G', 'A', 'D', 'Bm', 'Em', 'A',
          'G', 'A', 'F#m', 'Bm', 'Em', 'A7', 'D', 'A7']
mel(6, B, pop, 100, legato=0.85)
mel(3, B + 4, [pop[0]], 60, octave=1); mel(3, B + 12, [pop[0]], 60, octave=1)
for i, c in enumerate(pop_ch):
    t = (B + i) * 4
    r = bass_note(c, 33)
    for s, p, v in ((0, r, 100), (0.75, r, 70), (1.5, r + 12, 80), (2, r, 95),
                    (2.75, r + 7, 75), (3.5, r + 12, 80)):
        ev.append((8, t + s, 0.3, p, v))
    for s in (0, 1.5, 2.5):
        for p in voicing(c, 60):
            ev.append((7, t + s, 0.9 if s == 0 else 0.45, p, 64))
    hit(t, KICK, 100); hit(t + 1.5, KICK, 80); hit(t + 2, KICK, 95)
    hit(t + 1, SNARE, 95); hit(t + 3, SNARE, 95); hit(t + 3, CLAP, 70)
    for k in range(8):
        hit(t + k / 2, CHH if k != 7 else OHH, 70 if k % 2 == 0 else 50, 0.1)
    if i % 4 == 0:
        hit(t, CRASH, 90, 2)
# brass stab hits on the turn
for b in (B + 3, B + 7, B + 15):
    for p in voicing(pop_ch[b - B], 62):
        ev.append((0, b * 4 + 3.5, 0.3, p, 90))

# ===== 6. Keroncong - 1960s radio (8 bars, D -> C7) =====
B = 60
marks.append((B * 4, 'E: keroncong RRI (1960s)'))
kr = [
    [(78, 1.5), (76, .5), (74, 1), (73, .5), (74, .5)],
    [(78, 1), (81, 1), (78, 2)],
    [(76, 1.5), (78, .5), (79, 1), (76, 1)],
    [(73, 3), (0, 1)],
    [(71, 1), (74, 1), (79, 1.5), (78, .5)],
    [(76, 1), (73, 1), (69, 2)],
    [(74, 2), (78, 1), (81, 1)],
    [(79, 1), (76, 1), (72, 1), (70, 1)],
]
kr_ch = ['D', 'D', 'A7', 'A7', 'G', 'A7', 'D', 'C7']
mel(5, B, kr, 88, legato=0.95)
for i, c in enumerate(kr_ch):
    t = (B + i) * 4
    v = voicing(c, 62)
    # cak: off-beat 8ths, cuk: 16th answer
    for s in (0.5, 1, 1.5, 2.5, 3, 3.5):
        for p in v:
            ev.append((10, t + s, 0.22, p, 58 if s % 1 else 66))
    # cello pizz: roll-ing figure
    b = bass_note(c, 43)
    for s, p in ((0, b), (1, b + 7), (1.75, b + 12), (2, b + 7), (3, b + 4)):
        ev.append((11, t + s, 0.4, p, 78))
    ev.append((8, t, 0.6, bass_note(c, 31), 80)); ev.append((8, t + 2, 0.6, bass_note(c, 31) + 7, 70))
snare_roll((B + 7) * 4 + 2, 2, 40, 110)

# ===== 7. Reprise mars - full band (12 bars, F) =====
B = 68
marks.append((B * 4, 'A2: mars reprise'))
rep = march[:4] + march[8:]
rep_ch = march_ch[:4] + march_ch[8:]
mel(0, B, rep, 108)
mel(3, B, rep, 66, octave=1)
mel(14, B + 4, march[8:], 64, octave=-1)  # pianika an octave down
march_backing(B, rep_ch, cymbal_every=2)
for i, c in enumerate(rep_ch):
    for p in voicing(c, 55):
        ev.append((4, (B + i) * 4, 3.95, p, 50))

# ===== 8. Turnaround back to the top (4 bars) =====
B = 80
marks.append((B * 4, 'Turnaround'))
turn = [
    [(70, 1), (74, 1), (77, 2)],
    [(79, 1), (77, 1), (74, 2)],
    [(76, 1), (79, 1), (82, 1), (79, 1)],
    [(76, .5), (77, .5), (79, 1), (72, 1), (0, 1)],
]
turn_ch = ['Bb', 'Gm', 'C7', 'C7']
mel(0, B, turn, 104)
for i, c in enumerate(turn_ch):
    t = (B + i) * 4
    for p in voicing(c, 53):
        ev.append((1, t, 1.8, p, 78)); ev.append((1, t + 2, 1.8, p, 78))
    ev.append((2, t, 1.8, bass_note(c, 34), 100)); ev.append((2, t + 2, 1.8, bass_note(c, 34), 90))
    ev.append((13, t, 0.5, bass_note(c, 41), 85)); ev.append((13, t + 2, 0.5, bass_note(c, 41), 80))
    hit(t, KICK, 100); hit(t + 2, KICK, 90)
    if i < 3:
        hit(t + 1, SNARE, 80); hit(t + 3, SNARE, 80)
snare_roll(83 * 4 + 1, 3, 40, 115)

TOTAL_BARS = 84
END = TOTAL_BARS * 4
marks.append((END, 'loopEnd'))
for e in ev:
    assert e[1] < END, e

# ---------- MIDI writer ----------
def vlq(n):
    b = [n & 0x7F]
    n >>= 7
    while n:
        b.insert(0, (n & 0x7F) | 0x80)
        n >>= 7
    return bytes(b)

def track(events):  # events: (tick, order, bytes)
    events.sort(key=lambda e: (e[0], e[1]))
    out, last = b'', 0
    for tk, _, data in events:
        out += vlq(tk - last) + data
        last = tk
    out += vlq(0) + b'\xff\x2f\x00'
    return b'MTrk' + struct.pack('>I', len(out)) + out

def meta(t, data):
    return bytes([0xFF, t]) + vlq(len(data)) + data

NAMES = {0: 'Trumpet', 1: 'Trombone', 2: 'Tuba', 3: 'Glockenspiel', 4: 'Strings', 5: 'Suling/Flute',
         6: 'Synth Brass', 7: 'E.Piano', 8: 'Bass', 9: 'Drums+Kendang', 10: 'Cak-Cuk Guitar',
         11: 'Pizz Cello', 12: 'French Horn', 13: 'Timpani', 14: 'Pianika'}

tracks = []
cond = [(0, 0, meta(0x03, b'Mars Pak Pejabat (loop)')),
        (0, 0, meta(0x51, struct.pack('>I', int(60e6 / BPM))[1:])),
        (0, 0, meta(0x58, bytes([4, 2, 24, 8])))]
for b, txt in marks:
    cond.append((int(b * PPQ), 1, meta(0x06, txt.encode())))
cond.append((END * PPQ, 2, meta(0x01, b'')))
tracks.append(track(cond))
for ch in sorted(NAMES):
    es = [(0, 0, meta(0x03, NAMES[ch].encode()))]
    if ch == 0:
        es.append((0, 1, bytes([0xB0 | ch, 111, 0])))  # CC111 loop point (RPG Maker style)
    if ch != DR:
        es.append((0, 2, bytes([0xC0 | ch, programs[ch]])))
    es.append((0, 2, bytes([0xB0 | ch, 7, 100])))
    es.append((0, 2, bytes([0xB0 | ch, 91, 40])))
    for c, s, d, p, v in ev:
        if c != ch:
            continue
        on, off = int(round(s * PPQ)), int(round((s + d) * PPQ))
        off = min(max(off, on + 1), END * PPQ)
        es.append((on, 4, bytes([0x90 | ch, p, v])))
        es.append((off, 3, bytes([0x80 | ch, p, 0])))
    tracks.append(track(es))

mid = b'MThd' + struct.pack('>IHHH', 6, 1, len(tracks), PPQ) + b''.join(tracks)
open(os.path.join(ROOT, 'docs/music/mars-pak-pejabat.mid'), 'wb').write(mid)

# ---------- score for the game (src/music.ts plays it) ----------
# Per bar, flat [channel, start, length, midi note, velocity, ...]; start and length in 24ths of a beat.
Q = 24
bars = [[] for _ in range(TOTAL_BARS)]
for ch, s0, d, p, v in sorted(ev, key=lambda e: (e[1], e[0], e[3])):
    b = int(s0 // 4)
    bars[b] += [ch, round((s0 - b * 4) * Q), max(1, round(d * Q)), p, v]
lines = ['// Generated by scripts/music/compose.py. Do not edit: change the script and run it again.',
         '// Mars Pak Pejabat, an original 84-bar loop. Channels and instruments: see src/music.ts.',
         f'export const BPM = {BPM};',
         f'export const TICKS_PER_BEAT = {Q};',
         '// Per bar: [channel, start, length, midi note, velocity] repeated; start and length in ticks.',
         'export const SCORE: readonly (readonly number[])[] = [']
for i, b in enumerate(bars):
    lines.append('  [' + ','.join(map(str, b)) + '],')
lines.append('];')
lines.append('export const SECTIONS: readonly [number, string][] = [')
for bt, txt in marks:
    if txt not in ('loopStart', 'loopEnd'):
        lines.append(f'  [{int(bt // 4)}, {txt!r}],'.replace("'", "'"))
lines.append('];')
open(os.path.join(ROOT, 'src/music-score.ts'), 'w').write('\n'.join(lines) + '\n')
print('notes', len(ev), 'length s', END * SPB)
if '--preview' not in sys.argv:
    sys.exit(0)
outdir = sys.argv[sys.argv.index('--preview') + 1]
import numpy as np

# ---------- preview synth ----------
N = int(END * SPB * SR)
TAIL = int(3 * SR)
buf = np.zeros(N + TAIL)
rng = np.random.default_rng(7)

def hz(m):
    return 440 * 2 ** ((m - 69) / 12)

def env(n, a, d_s, sus, rel, dur_n):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4))
    e = e * (sus + (1 - sus) * np.exp(-t / max(d_s, 1e-4)))
    held = dur_n / SR
    e = np.where(t > held, e * np.exp(-(t - held) / rel), e)
    return e

def additive(f, n, amps, vib=0.0, vib_hz=5.5):
    t = np.arange(n) / SR
    ph = 2 * np.pi * f * t
    if vib:
        ph = ph + (vib * f / vib_hz) * np.sin(2 * np.pi * vib_hz * t) * np.minimum(1, t / 0.3)
    out = np.zeros(n)
    for k, a in enumerate(amps, 1):
        if f * k < SR / 2.2:
            out += a * np.sin(k * ph)
    return out

SAW = [1 / k for k in range(1, 14)]
BRASS = [1, .7, .55, .45, .35, .28, .2, .15, .1, .07]
SQ = [1 / k if k % 2 else 0 for k in range(1, 14)]

def voice(ch, p, dur, vel):
    f = hz(p)
    d = int(dur * SPB * SR)
    g = (vel / 127) ** 1.6
    if ch in (0, 1, 2, 12):
        n = d + int(0.15 * SR)
        amps = BRASS if ch != 12 else [1, .4, .2, .1]
        s = additive(f, n, amps, vib=0.004 if ch == 0 else 0)
        s *= env(n, 0.025, 0.2, 0.75, 0.06, d)
        return s * g * {0: .22, 1: .1, 2: .3, 12: .25}[ch]
    if ch == 6:
        n = d + int(0.1 * SR)
        s = additive(f, n, SAW[:9]) + 0.6 * additive(f * 1.006, n, SAW[:9])
        return s * env(n, 0.01, 0.15, 0.6, 0.05, d) * g * .12
    if ch == 3:
        n = int(1.2 * SR)
        t = np.arange(n) / SR
        s = np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 20)
        return s * np.exp(-t * 4) * g * .12
    if ch == 4:
        n = d + int(0.4 * SR)
        s = additive(f, n, SAW[:8], vib=0.005) + additive(f * 1.004, n, SAW[:8], vib=0.005)
        return s * env(n, 0.25, 1, 1, 0.3, d) * g * .05
    if ch == 5:
        n = d + int(0.08 * SR)
        s = additive(f, n, [1, .25, .08], vib=0.012, vib_hz=6)
        s += 0.05 * rng.standard_normal(n)
        return s * env(n, 0.04, 0.3, 0.8, 0.05, d) * g * .25
    if ch == 14:
        n = d + int(0.05 * SR)
        s = additive(f, n, SQ[:9]) + additive(f * 1.003, n, SQ[:9])
        return s * env(n, 0.02, 0.3, 0.8, 0.04, d) * g * .07
    if ch == 7:
        n = d + int(0.5 * SR)
        t = np.arange(n) / SR
        s = np.sin(2 * np.pi * f * t + 1.5 * np.exp(-t * 6) * np.sin(2 * np.pi * f * 2 * t))
        return s * env(n, 0.005, 0.6, 0.3, 0.25, d) * g * .14
    if ch == 8:
        n = d + int(0.06 * SR)
        s = additive(f, n, [1, .5, .25, .1])
        return s * env(n, 0.005, 0.3, 0.5, 0.04, d) * g * .4
    if ch in (10, 11):
        n = int((0.5 if ch == 10 else 0.6) * SR)
        t = np.arange(n) / SR
        s = additive(f, n, [1, .6, .45, .3, .2, .12])
        s *= np.exp(-t * (14 if ch == 10 else 8))
        return s * g * (.09 if ch == 10 else .3)
    if ch == 13:
        n = int(1.0 * SR)
        t = np.arange(n) / SR
        ph = 2 * np.pi * np.cumsum(f * (1 + .15 * np.exp(-t * 30))) / SR
        s = np.sin(ph) + .3 * np.sin(1.5 * ph)
        return s * np.exp(-t * 3.5) * g * .4
    raise ValueError(ch)

def drum(n_, vel):
    g = (vel / 127) ** 1.4
    def tone(f0, f1, dec, length, amp):
        n = int(length * SR); t = np.arange(n) / SR
        fr = f1 + (f0 - f1) * np.exp(-t * 40)
        return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * dec) * amp
    def noise(dec, length, amp, hp=True):
        n = int(length * SR); t = np.arange(n) / SR
        x = rng.standard_normal(n)
        if hp:
            x = np.diff(x, prepend=0)
        return x * np.exp(-t * dec) * amp
    if n_ == KICK:
        s = tone(150, 50, 9, .4, 1.0)
    elif n_ == SNARE:
        s = mix(noise(22, .25, .35), tone(330, 190, 30, .15, .3))
    elif n_ == CLAP:
        s = noise(30, .2, .3)
    elif n_ in (CHH, TAMB):
        s = noise(60 if n_ == CHH else 35, .12, .12)
        s = np.diff(s, prepend=0)
    elif n_ == OHH:
        s = np.diff(noise(10, .4, .12), prepend=0)
    elif n_ in (CRASH, RIDE):
        s = np.diff(noise(2.5 if n_ == CRASH else 8, 2.0 if n_ == CRASH else .6, .15 if n_ == CRASH else .07), prepend=0)
    elif n_ == LCONGA:  # dhut
        s = tone(160, 95, 10, .35, .7)
    elif n_ == OHCONGA:  # tak
        s = mix(tone(420, 330, 25, .15, .45), noise(60, .05, .15))
    elif n_ == MHCONGA:
        s = tone(330, 280, 40, .1, .4)
    elif n_ == HBONGO:
        s = tone(520, 440, 30, .12, .35)
    elif n_ == LBONGO:
        s = tone(380, 300, 25, .14, .4)
    else:
        return np.zeros(1)
    return s * g * .5

def mix(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o

for ch, s0, d, p, v in ev:
    x = drum(p, v) if ch == DR else voice(ch, p, d, v)
    i0 = int(s0 * SPB * SR)
    buf[i0:i0 + len(x)] += x

# Simple room: a few feedback-less early reflections
rev = np.zeros_like(buf)
for dly, a in ((0.031, .25), (0.047, .2), (0.071, .15), (0.113, .1), (0.167, .07)):
    k = int(dly * SR)
    rev[k:] += buf[:-k] * a
buf += rev
# wrap the tail onto the start so the loop is seamless
loop = buf[:N].copy()
loop[:TAIL] += buf[N:N + TAIL]
loop /= np.max(np.abs(loop)) * 1.12
pcm = (np.tanh(loop * 1.1) * 32767).astype('<i2')
stereo = np.repeat(pcm[:, None], 2, axis=1)
import wave
with wave.open(f'{outdir}/mars-pak-pejabat.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(stereo.tobytes())
print('wav seconds', len(loop) / SR)
