"""Builds src/fonts/pak-pixel-{400,700}.woff2 from @fontsource/pixelify-sans (OFL).

Pixelify Sans draws a lowercase f as a capital F with a small left shelf, so "Buku Combo" style titles
read as "A" or "F" at a glance. This redraws f with the crossbar running both sides of the stem and a
chamfered hook, and drops the f ligatures that reuse the old shape. Its 2 curls back at the foot and reads
as a Z or an S on the HUD ("T2" as "TZ"), so the 2 is redrawn as a plain pixel 2: a diagonal down to a full
bottom bar. Its 5 has a round top and reads as an S ("2045" as "204S"), so the 5 gets a flat top and a square corner. Renamed to Pak Pixel as the OFL asks for modified versions. Needs: pip install fonttools brotli.
Run from the repo root.
"""
import glob
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen

# (stem left, stem right, shelf left, bar bottom, bar top, mid-bar lo, hi, right end, top lo, hi, drop right, drop lo)
# One clockwise contour per weight, in font units.
OUTLINES = {
    '400': [(151, -12), (151, 350), (60, 350), (60, 450), (151, 450), (151, 540), (252, 540), (252, 631), (433, 631), (433, 540), (525, 540), (525, 440), (423, 440), (423, 530), (252, 530), (252, 450), (343, 450), (343, 350), (252, 350), (252, -12)],
    '700': [(149, -11), (149, 331), (61, 331), (61, 467), (149, 467), (149, 552), (276, 552), (276, 638), (453, 638), (453, 552), (542, 552), (542, 416), (414, 416), (414, 501), (276, 501), (276, 467), (365, 467), (365, 331), (276, 331), (276, -11)],
}

# The 2 on the font's own 5x7 pixel grid, top row first. Bold grows each pixel by BOLD units a side, as its stems are wider.
TWO = ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####']
FIVE = ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.']
GRID = {
    '400': ([60, 151, 242, 333, 433, 525], [-12, 78, 169, 260, 350, 440, 540, 631], 0),
    '700': ([61, 153, 245, 337, 450, 542], [-11, 80, 172, 263, 355, 446, 547, 638], 18),
}


def pixel_glyph(font, rows, xs, ys, grow):
    pen = TTGlyphPen(font.getGlyphSet())
    for r, line in enumerate(reversed(rows)):
        for c, ch in enumerate(line):
            if ch != '#':
                continue
            x0, x1 = max(xs[0], xs[c] - grow), min(xs[-1], xs[c + 1] + grow)
            y0, y1 = max(ys[0], ys[r] - grow), min(ys[-1], ys[r + 1] + grow)
            # Clockwise, like the font's own contours. Overlapping squares merge under the non-zero fill rule.
            pen.moveTo((x0, y0))
            pen.lineTo((x0, y1))
            pen.lineTo((x1, y1))
            pen.lineTo((x1, y0))
            pen.closePath()
    return pen.glyph()


for w, pts in OUTLINES.items():
    src = glob.glob(f'node_modules/@fontsource/pixelify-sans/files/*latin-{w}-normal.woff2')[0]
    font = TTFont(src)
    pen = TTGlyphPen(font.getGlyphSet())
    pen.moveTo(pts[0])
    for p in pts[1:]:
        pen.lineTo(p)
    pen.closePath()
    font['glyf']['f'] = pen.glyph()
    xs, ys, grow = GRID[w]
    font['glyf']['two'] = pixel_glyph(font, TWO, xs, ys, grow)
    font['glyf']['five'] = pixel_glyph(font, FIVE, xs, ys, grow)
    # No f ligatures: they would bring the old shape back.
    for rec in font['GSUB'].table.FeatureList.FeatureRecord:
        if rec.FeatureTag == 'liga':
            rec.Feature.LookupListIndex = []
    for rec in font['name'].names:
        if rec.nameID in (1, 16):
            rec.string = 'Pak Pixel'
        elif rec.nameID in (4, 6):
            rec.string = f'Pak Pixel {w}' if rec.nameID == 4 else f'PakPixel-{w}'
    font.flavor = 'woff2'
    font.save(f'src/fonts/pak-pixel-{w}.woff2')
    print('wrote', w)
