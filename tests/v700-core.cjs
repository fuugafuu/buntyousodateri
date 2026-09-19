const assert=require('node:assert/strict');
const fs=require('node:fs');

process.env.MOFUMORI_SESSION_SECRET='test-session-secret-abcdefghijklmnopqrstuvwxyz';
const auth=require('../server/auth.cjs');

const user={id:'local:test-user',name:'Test User',provider:'mofumori'};
const token=auth.createSessionToken(user,3600);
const decoded=auth.verifySessionToken(token);
assert.equal(decoded.id,user.id);
assert.equal(decoded.name,user.name);
assert.equal(decoded.provider,'mofumori');
assert.throws(()=>auth.verifySessionToken(token+'x'));

function has(file,needle,label){
  const text=fs.readFileSync(file,'utf8');
  if(!text.includes(needle))throw new Error(label+' ('+file+')');
}
has('api/auth/google.js','sessionCookie(user)','Google login must issue durable app session');
has('api/auth/local.js',"action==='register'",'Local account registration must exist');
has('api/auth/local.js',"await scrypt(pass,salt,32",'Local passwords must use scrypt');
has('api/progression.js',"3回お世話する",'Daily progression goals must exist');
has('api/pets.js',"beaver:['ビーバー','🦫']", 'Beaver must exist in server species metadata');
has('api/pets.js',"forestLevel >= 3",'Beaver gacha must be level-gated');
has('main.js',"beaver:{name:'ビーバー'",'Beaver must exist in client species data');
has('main.js','if(isBeaver){','Beaver must have dedicated renderer');
has('v7-ui.js','Mofumoriログイン','Local account UI must be present');
has('v7-ui.js','FOREST JOURNEY','Forest progression UI must be present');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
assert.match(pkg.version,/^7\./);
has('index.html',`window.MOFUMORI_BUILD='${pkg.version}'`,'Browser build must match package version');
console.log('v7 core regression checks passed');
