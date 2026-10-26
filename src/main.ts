import '@fontsource/pixelify-sans/latin-400.css';
import '@fontsource/pixelify-sans/latin-700.css';
import './style.css';
import { setupInstall } from './pwa/install';
import { setupUpdates } from './pwa/update';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

function toast(text: string): void {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  el.addEventListener('click', () => el.remove());
  document.body.appendChild(el);
}

setupInstall($<HTMLButtonElement>('install-btn'), toast);
setupUpdates($('update-banner'), $<HTMLButtonElement>('update-btn'));

// Placeholder map until the simulation core lands.
const canvas = $<HTMLCanvasElement>('map');
function draw(): void {
  const dpr = window.devicePixelRatio || 1;
  const { clientWidth: w, clientHeight: h } = canvas;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#0b0b0c';
  ctx.fillRect(0, 0, w, h);
  const size = Math.floor(Math.min(w, h) / 10);
  for (let y = 0; y < 10; y++)
    for (let x = 0; x < 10; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#3b5f2a' : '#436b30';
      ctx.fillRect((w - size * 10) / 2 + x * size, (h - size * 10) / 2 + y * size, size, size);
    }
}
window.addEventListener('resize', draw);
draw();
