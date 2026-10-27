"""Builds src/fonts/pak-pixel-{400,700}.woff2 from @fontsource/pixelify-sans (OFL).

Pixelify Sans draws a lowercase f as a capital F with a small left shelf, so "Buku Combo" style titles
read as "A" or "F" at a glance. This redraws f with the crossbar running both sides of the stem and a
chamfered hook, and drops the f ligatures that reuse the old shape. Renamed to Pak Pixel as the OFL asks
for modified versions. Needs: pip install fonttools brotli. Run from the repo root.
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

for w, pts in OUTLINES.items():
    src = glob.glob(f'node_modules/@fontsource/pixelify-sans/files/*latin-{w}-normal.woff2')[0]
    font = TTFont(src)
    pen = TTGlyphPen(font.getGlyphSet())
    pen.moveTo(pts[0])
    for p in pts[1:]:
        pen.lineTo(p)
    pen.closePath()
    font['glyf']['f'] = pen.glyph()
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
