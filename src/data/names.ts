// Resident names. Generic given names only, no regional or ethnic markers.
export const TITLES = ['Pak', 'Bu', 'Mas', 'Mbak'];
/** Given names by gender, so a title always fits its name: no Pak Yanti, no Bu Joko. */
export const MALE_NAMES = ['Adi', 'Agus', 'Bayu', 'Budi', 'Eko', 'Fajar', 'Hadi', 'Joko', 'Oki', 'Rizki', 'Rudi', 'Tono', 'Wahyu', 'Yudi', 'Zaki'];
export const FEMALE_NAMES = ['Ani', 'Citra', 'Dewi', 'Gita', 'Indah', 'Lina', 'Maya', 'Putri', 'Rina', 'Sari', 'Tari', 'Umi', 'Vina', 'Wati', 'Yanti'];
/** Names used for either. */
export const UNISEX_NAMES = ['Dian', 'Eka', 'Kiki', 'Nanda'];
export const NAMES = [...MALE_NAMES, ...FEMALE_NAMES, ...UNISEX_NAMES];

/** Bu and Mbak are women, Pak and Mas men. */
export const isFemaleTitle = (title: string): boolean => title === 'Bu' || title === 'Mbak';
/** Whether a full name ("Bu Sari") is a woman's, by its title. */
export const isFemaleName = (name: string): boolean => isFemaleTitle(name.split(' ')[0]);
/** The given names that fit a title. */
export const namesFor = (title: string): string[] => [...(isFemaleTitle(title) ? FEMALE_NAMES : MALE_NAMES), ...UNISEX_NAMES];

/** Kampung names for the dice on New Game: flowers and fruit, no real places. Shown after "Kampung". */
export const KAMPUNG_NAMES = ['Kenanga', 'Melati', 'Cempaka', 'Durian', 'Bambu', 'Salak', 'Kelapa', 'Mangga', 'Jambu', 'Kemuning', 'Sawo', 'Belimbing'];
/** Longest player or kampung name, so the goal pill and the SK still fit at 320px. */
export const PLAYER_NAME_MAX = 12;
