const fs = require('fs');
const content = fs.readFileSync('C:/Users/ASUS/Downloads/maison-vie/dist/assets/BookingKanban.utf8.js', 'utf8');
const texts = content.match(/children:"([^"]+)"/g) || [];
console.log(texts.slice(0, 100));
