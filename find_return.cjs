const fs = require('fs');
const lines = fs.readFileSync('src/components/booking/BookingKanban.tsx', 'utf8').split('\n');
const index = lines.findIndex(l => l.includes('return (') && l.includes('div className='));
if (index === -1) {
    const idx = lines.findIndex(l => l.includes('return') && l.includes('<div'));
    console.log(lines.slice(idx, idx + 30).join('\n'));
} else {
    console.log(lines.slice(index, index + 30).join('\n'));
}
