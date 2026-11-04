// Who runs which RT, for the nameplates on the map and the Neighbours list (TODO: "Show which RW and RT is yours").
import { t } from '../i18n';
import { cellOrigin, rwOf } from './area';
import { cellName } from './grow';
import { mapSpan, type GameState } from './types';

export interface CellPlate {
  /** The tile the plate stands on: the RT's far (top) corner. */
  x: number;
  y: number;
  text: string;
  mine: boolean;
}

/** The RW an RT belongs to, as players count them: RW 1 is the player's own. */
export const rwNumber = (cx: number, cy: number): number => rwOf(cx, cy).ry + rwOf(cx, cy).rx + 1;

/** One plate per RT on a map of two or more: "RT 1 · Yours" or "Kampung Sebelah · AI", with the RW once there are two. */
export function cellPlates(s: GameState): CellPlate[] {
  const { w, h } = mapSpan();
  if (w * h < 2) return [];
  const rws = h > 1;
  const out: CellPlate[] = [];
  for (let cy = 0; cy < h; cy++)
    for (let cx = 0; cx < w; cx++) {
      const n = s.neighbours.find((q) => q.cx === cx && q.cy === cy);
      const own = (cx === 0 && cy === 0) || n?.run === 'player' || !!n?.absorbed;
      if (!own && !n) continue;
      const name = n ? cellName(n) : 'RT 1';
      const who = own ? t('map.yours') : t('map.ai');
      const o = cellOrigin(cx, cy);
      out.push({ x: o.x, y: o.y, text: rws ? t('map.plateRw', { name, rw: rwNumber(cx, cy), who }) : t('map.plate', { name, who }), mine: own });
    }
  return out;
}
