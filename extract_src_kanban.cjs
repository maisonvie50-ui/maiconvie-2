const fs = require('fs');
const code = fs.readFileSync('src/components/booking/BookingKanban.tsx', 'utf8');
const strings = code.match(/(["'`])(?:(?=(\\?))\2.)*?\1/g);
if (strings) {
  const vietnameseStrings = strings.filter(s => /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/.test(s));
  const unique = [...new Set(vietnameseStrings)];
  fs.writeFileSync('src_kanban_strings.txt', unique.join('\n'));
  console.log(`Found ${unique.length} Vietnamese strings, written to src_kanban_strings.txt`);
} else {
  console.log('No strings found');
}
