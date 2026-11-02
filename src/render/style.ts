// Local art-style experiment: the gritty kampung look (zinc and rust roofs, stained walls, cement
// paving, a kali with floating rubbish). Off unless the page is opened with ?art=kampung, so the
// shipped look and every test stay as they are.
export const GRIT = typeof location !== 'undefined' && new URLSearchParams(location.search).get('art') === 'kampung';
