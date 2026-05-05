const fs = require('fs');
const code = fs.readFileSync('settings_beautified.js', 'utf8');
const tabsMatch = code.match(/setActiveTab\(['"](.*?)['"]\)/g);
console.log('setActiveTab calls:', tabsMatch ? [...new Set(tabsMatch)] : 'None');

const tabsMatch2 = code.match(/activeTab\s*===\s*['"](.*?)['"]/g);
console.log('activeTab checks:', tabsMatch2 ? [...new Set(tabsMatch2)] : 'None');
