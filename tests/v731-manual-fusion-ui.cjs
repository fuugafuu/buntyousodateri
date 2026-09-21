const assert=require('node:assert/strict');
const fs=require('node:fs');

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const html=fs.readFileSync('index.html','utf8');
const ui=fs.readFileSync('pet-system.js','utf8');
const profile=fs.readFileSync('v6-ui.js','utf8');
const main=fs.readFileSync('main.js','utf8');
const css=fs.readFileSync('pet-system.css','utf8');

assert.equal(pkg.version,'7.3.1');
assert.ok(html.includes("window.MOFUMORI_BUILD='7.3.1'"));

assert.ok(ui.includes("b.textContent='🧬 手動合成'"),'manual fusion button missing');
assert.ok(ui.includes('fusionTarget:null')&&ui.includes('fusionMaterials:new Set()'),'manual fusion state missing');
assert.ok(ui.includes('data-fusion-target')&&ui.includes('data-fusion-material'),'manual target/material selection missing');
assert.ok(ui.includes("api('fusePets',{targetPetId:target.id,materialPetIds:materials.map(p=>p.id)})"),'manual fusion must send exact selected IDs');
assert.ok(ui.includes("p.lifeStage==='adult'")&&ui.includes('!p.customNamed'),'fusion protections missing');

assert.ok(ui.includes('なぞの卵')&&ui.includes('種類・ランク・見た目は孵化するまで不明'),'egg list secrecy missing');
assert.ok(profile.includes('UNKNOWN EGG')&&profile.includes('ランク未公開')&&profile.includes('種類未公開'),'egg profile secrecy missing');
assert.ok(profile.includes("stage==='egg'?'':"),'egg genetics/stats must be hidden');
assert.ok(main.includes("activeLifecycle?.lifeStage==='egg'")&&main.includes("activeLifecycle?.lifeStage==='chick'"),'main room lifecycle rendering missing');

assert.ok(ui.includes('speciesName:String(p?.speciesName||b.name)')&&ui.includes('icon:String(p?.icon||b.icon)'),'server gacha identity fields must be preserved');
assert.ok(ui.includes('data-pet-id=')&&ui.includes('p.icon||m.b.icon')&&ui.includes('p.speciesName||m.b.name'),'gacha reveal must render exact returned pet');

assert.ok(ui.includes('function visitorBirdSvg('),'rendered visitor SVG missing');
assert.ok(ui.includes('visit-birds-row')&&ui.includes('visit-bird-render'),'side-by-side visitor birds missing');
assert.ok(ui.includes('incoming.slice(0,3)'),'multiple visitors should render together');
assert.ok(css.includes('.visit-birds-row')&&css.includes('.visit-bird-unit')&&css.includes('.visit-bird-render svg'),'visitor layout CSS missing');

console.log('v7.3.1 guards: manual fusion, egg secrecy, exact gacha identity, rendered visitors OK');
