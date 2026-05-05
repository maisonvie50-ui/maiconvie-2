const fs=require('fs');
const code=fs.readFileSync('kanban_beautified.js','utf8');
for (const name of ['dn','gn','changeRequestData','approve','reject']) {
  console.log('---', name);
  let idx=0,c=0;
  while((idx=code.indexOf(name, idx))>=0 && c<20){
    console.log(idx, code.slice(Math.max(0,idx-120), idx+180).replace(/\s+/g,' '));
    idx+=name.length; c++;
  }
}
