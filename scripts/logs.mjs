// Prints every file in decisions/ or progress/, one section per file.
import { readdirSync, readFileSync } from 'node:fs';

const dir = process.argv[2];
if (dir !== 'decisions' && dir !== 'progress') {
  console.error('usage: node scripts/logs.mjs decisions|progress');
  process.exit(1);
}
const files = readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md').sort();
for (const f of files) console.log(`## ${f.replace(/\.md$/, '')}\n\n${readFileSync(`${dir}/${f}`, 'utf8').trim()}\n`);
