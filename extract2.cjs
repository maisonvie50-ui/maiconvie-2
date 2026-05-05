const fs = require('fs');
const content = fs.readFileSync('C:/Users/ASUS/Downloads/maison-vie/dist/assets/BookingKanban.utf8.js', 'utf8');
const texts = content.match(/children:"([^"]+)"/g) || [];
fs.writeFileSync('C:/Users/ASUS/Downloads/maison-vie/extract.json', JSON.stringify(texts.slice(0, 1000), null, 2));
