export interface BadgeBox {
  x: number;
  y: number;
  w: number;
}

export const BADGE_H = 20;

/** Moves a badge up in whole badge-heights until it clears the ones already drawn, and records it. */
export function placeBadge(placed: BadgeBox[], cx: number, cy: number, w: number): number {
  let y = cy;
  while (placed.some((p) => Math.abs(p.x - cx) < (p.w + w) / 2 && Math.abs(p.y - y) < BADGE_H)) y -= BADGE_H + 2;
  placed.push({ x: cx, y, w });
  return y;
}
