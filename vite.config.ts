import { defineConfig, type Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Emits sw.js with the list of built files to precache.
// The version hash changes whenever any output changes, which triggers the update banner.
function serviceWorker(): Plugin {
  return {
    name: 'pakrt-sw',
    apply: 'build',
    generateBundle(_opts, bundle) {
      // Skip .woff fallbacks: every browser that runs a service worker supports woff2.
      const files = Object.keys(bundle).filter((f) => !f.endsWith('.map') && !f.endsWith('.woff'));
      const publicFiles = ['manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon.svg'];
      const precache = ['./', ...files, ...publicFiles];
      const hash = createHash('sha256');
      for (const f of files) {
        const item = bundle[f];
        hash.update(f);
        hash.update(item.type === 'chunk' ? item.code : typeof item.source === 'string' ? item.source : Buffer.from(item.source));
      }
      const version = hash.digest('hex').slice(0, 12);
      const src = readFileSync('src/sw/sw.js', 'utf8')
        .replace('__VERSION__', version)
        .replace('__PRECACHE__', JSON.stringify(precache));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: src });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [serviceWorker()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    // The game, plus the in-game UI mockup so it can be opened on the live site at /mockup.html.
    rollupOptions: { input: { main: 'index.html', mockup: 'mockup.html' } },
  },
});
