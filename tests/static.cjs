const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'game.js'),'utf8');
const css=fs.readFileSync(path.join(root,'style.css'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'HTML ids must be unique');
for(const m of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(m[1]),'Missing DOM id: '+m[1]);
for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
  if(m[1]==='./')continue;
  assert.ok(fs.existsSync(path.join(root,m[1])),'Missing local asset: '+m[1]);
}
for(const m of css.matchAll(/url\('([^']+)'\)/g))assert.ok(fs.existsSync(path.join(root,m[1])));
assert.ok(html.includes('lang="zh-CN"'));
assert.ok(html.includes('name="viewport"'));
assert.ok(css.includes('prefers-reduced-motion'));
assert.ok(css.includes('@media(max-width:700px)'));
const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../.openai/hosting.json'),'utf8'));
assert.equal(manifest.static.directory,'dist');assert.ok(manifest.project_id);
console.log('PASS: page entrypoint, unique ids, UI references, local assets, responsive rules, metadata, hosting manifest.');
