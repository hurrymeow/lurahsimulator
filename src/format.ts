const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Full Rupiah with dot separators: Rp 5.200.000 */
export function rupiah(n: number): string {
  const sign = n < 0 ? '-' : '';
  const digits = Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}Rp ${digits}`;
}

/** Rupiah for the slim top bar, next to the money icon: 850rb, 4,85jt, 1,23M */
export function rupiahHud(n: number): string {
  const a = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  const fmt = (v: number) => (v >= 100 ? Math.floor(v).toString() : (Math.floor(v * 100 + 1e-6) / 100).toString().replace('.', ','));
  if (a >= 1e9) return `${sign}${fmt(a / 1e9)}M`;
  if (a >= 1e6) return `${sign}${fmt(a / 1e6)}jt`;
  if (a >= 1e3) return `${sign}${Math.floor(a / 1e3)}rb`;
  return `${sign}${Math.round(a)}`;
}

/** Compact Rupiah for number pops: 150rb, 1,2jt, 3,4M */
export function rupiahShort(n: number): string {
  const a = Math.abs(n);
  const sign = n < 0 ? '-' : '+';
  const fmt = (v: number) => (v >= 10 ? Math.round(v).toString() : v.toFixed(1).replace('.0', '').replace('.', ','));
  if (a >= 1e9) return `${sign}${fmt(a / 1e9)}M`;
  if (a >= 1e6) return `${sign}${fmt(a / 1e6)}jt`;
  if (a >= 1e3) return `${sign}${fmt(a / 1e3)}rb`;
  return `${sign}${Math.round(a)}`;
}

export function monthName(month: number): string {
  return MONTHS[((month % 12) + 12) % 12];
}

export function dateLabel(month: number): string {
  return `${monthName(month)} · Year ${Math.floor(month / 12) + 1}`;
}

export function signed(n: number): string {
  return (n >= 0 ? '+' : '') + Math.round(n);
}
