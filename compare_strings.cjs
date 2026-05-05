const fs = require('fs');
const dist = fs.readFileSync('kanban_strings.txt', 'utf8').split('\n').map(s => s.trim());
const src = fs.readFileSync('src_kanban_strings.txt', 'utf8').split('\n').map(s => s.trim());

const missingInSrc = dist.filter(s => !src.includes(s));
fs.writeFileSync('missing_in_src.txt', missingInSrc.join('\n'));
console.log(`Found ${missingInSrc.length} strings in dist that are not in src`);
