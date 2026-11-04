import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Pixelify Sans draws a lowercase f like a capital F ("Efek" read as "EFek"). The app ships a patched copy.
describe('pixel font', () => {
  const css = readFileSync('src/style.css', 'utf8');
  const main = readFileSync('src/main.ts', 'utf8');

  it('headings use the patched Pak Pixel font, never the stock Pixelify Sans', () => {
    expect(css).toMatch(/--font-pixel: 'Pak Pixel'/);
    expect(css).not.toMatch(/Pixelify Sans/);
    expect(main).not.toMatch(/fontsource\/pixelify/);
  });

  it('ships both weights and the build script that makes them', () => {
    for (const w of ['400', '700']) expect(readFileSync(`src/fonts/pak-pixel-${w}.woff2`).length).toBeGreaterThan(1000);
    const script = readFileSync('scripts/patch-pixel-font.py', 'utf8');
    expect(script).toContain("font['glyf']['f']");
    // The stock 2 and 5 read as Z and S on the HUD ("T2", "2045"): both are redrawn (playtest SK 2).
    expect(script).toContain("font['glyf']['two']");
    expect(script).toContain("font['glyf']['five']");
  });
});
