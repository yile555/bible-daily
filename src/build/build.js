// 把故事組、註釋、節號修正寫進 preview.html
const fs=require('fs');
const P='/home/claude/bible-daily/preview.html';
let h=fs.readFileSync(P,'utf8');
function grab(name){ // 取出 const NAME = {...}; 的範圍
  const s=h.indexOf(`const ${name} = `); let i=h.indexOf('{',s), d=0, j=i, q=null;
  for(;j<h.length;j++){const c=h[j];
    if(q){ if(c==='\\'){j++;continue;} if(c===q)q=null; continue;}
    if(c==='"'||c==="'"||c==='`'){q=c;continue;}
    if(c==='{')d++; else if(c==='}'){d--; if(d===0)break;}}
  return {s, start:i, end:j+1, obj:eval('('+h.slice(i,j+1)+')')};
}
function parseStories(file){
  const t=fs.readFileSync(file,'utf8'); const out=[];
  for(const b of t.split(/\n(?=### )/)){
    const m=b.match(/^### (\d+):(\d+)｜([^｜\s]+)/); if(!m) continue;
    const body=b.split('\n').slice(2).join('\n');
    const story=body.split('**默想**')[0].trim();
    const g=k=>{const r=b.match(new RegExp('\\*\\*'+k+'\\*\\*：(.*)'));return r[1].trim();};
    const pr=g('禱告'); if(pr.startsWith('親愛的')||pr.includes('阿門')||!pr.endsWith('。')) throw 'prayer '+m[0];
    out.push({ch:m[1],v:m[2],set:{fruit:m[3],story,reflect:(b.split('**默想**：')[1]||'').split('**格言**')[0].trim().split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean).join('\n'),maxim:g('格言'),prayer:pr}});
  }
  return out;
}
function parseNotes(file){
  const t=fs.readFileSync(file,'utf8'); const out=[];
  for(const b of t.split(/\n(?=### )/)){
    const m=b.match(/^### (\d+):(\d+)/); if(!m) continue;
    const g=k=>{const r=b.match(new RegExp('\\*\\*'+k+'\\*\\*：(.*)'));if(!r)throw k+m[0];return r[1].trim();};
    out.push({ch:m[1],v:m[2],n:{plain:g('白話'),orig:g('原文'),deep:g('細讀')}});
  }
  return out;
}
const args=process.argv.slice(2);
// SETS
let S=grab('SETS');
for(const f of args.filter(a=>a.includes('/stories/')))
  for(const x of parseStories(f)){ (S.obj[x.ch]=S.obj[x.ch]||{})[x.v]=x.set; }
const sortObj=o=>Object.fromEntries(Object.keys(o).sort((a,b)=>a-b).map(k=>[k,typeof o[k]==='object'&&!('story' in o[k])&&!('plain' in o[k])?sortObj(o[k]):o[k]]));
h=h.slice(0,S.start)+JSON.stringify(sortObj(S.obj),null,1)+h.slice(S.end);
// NOTES
let N=grab('NOTES');
for(const f of args.filter(a=>a.includes('/notes/')))
  for(const x of parseNotes(f)){ (N.obj[x.ch]=N.obj[x.ch]||{})[x.v]=x.n; }
h=h.slice(0,N.start)+JSON.stringify(sortObj(N.obj),null,1)+h.slice(N.end);
fs.writeFileSync(P,h);
console.log('SETS chapters',Object.keys(S.obj).length,'sets',Object.values(S.obj).reduce((a,o)=>a+Object.keys(o).length,0));
console.log('NOTES chapters',Object.keys(N.obj).join(','),'verses',Object.values(N.obj).reduce((a,o)=>a+Object.keys(o).length,0));
