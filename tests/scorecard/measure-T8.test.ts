import { describe, it } from 'vitest';
import { longestSystemRun, starKindRows } from './scorecard';

// Scratch measuring file for T8: prints the reward kinds per star. The reviewer deletes it.
describe('measure T8', () => {
  it('prints the reward kinds of every star', () => {
    const rows = starKindRows();
    for (const r of rows) console.log(`${r.stage} ${r.star + 1}★: ${r.kinds.join(', ') || 'none'}`);
    console.log('longest run without a new system:', longestSystemRun(rows));
    console.log('under 2 kinds:', rows.filter((r) => r.kinds.length < 2).map((r) => `${r.stage} ${r.star + 1}★ (${r.kinds.length})`).join(', ') || 'none');
  });
});
