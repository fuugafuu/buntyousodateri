const assert=require('node:assert/strict');
const fs=require('node:fs');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const html=fs.readFileSync('index.html','utf8');
const pets=fs.readFileSync('api/pets.js','utf8');
const arena=fs.readFileSync('api/arena.js','utf8');
const ui=fs.readFileSync('pet-system.js','utf8');
const css=fs.readFileSync('pet-system.css','utf8');
const profile=fs.readFileSync('v6-ui.js','utf8');
const profileCss=fs.readFileSync('v6-ui.css','utf8');
const sql=fs.readFileSync('supabase/mofumori_v7_3_0_breeding_genetics.sql','utf8');

assert.equal(pkg.version,'7.3.0');
assert.ok(html.includes("window.MOFUMORI_BUILD='7.3.0'"));
assert.ok(pets.includes("action === 'startBreeding'")&&pets.includes("action === 'ackLifecycleEvent'"));
assert.ok(pets.includes('function inheritGenes(')&&pets.includes('function deriveChild(')&&pets.includes('baselineGenetics'));
assert.ok(pets.includes('fatherId:row.father_id')&&pets.includes('motherId:row.mother_id')&&pets.includes('generation:Number(row.generation||0)'));
assert.ok(pets.includes('resolveBreedingAndLifecycle')&&pets.includes('mofumori_finish_breeding'));
assert.ok(pets.includes('.limit(1000)'),'multigeneration collection must not keep old 250 cap');

assert.ok(ui.includes('function breedingUi()')&&ui.includes('function startBreedingNow()'));
assert.ok(ui.includes('function queueLifecycleEvents(')&&ui.includes('function showNextLifeEvent('));
assert.ok(ui.includes("type==='egg_laid'")&&ui.includes("type==='hatched'"));
assert.ok(ui.includes("p.lifeStage==='egg'")&&ui.includes("stage==='chick'"));
assert.ok(ui.includes('breedingBusySet')&&ui.includes('parentIds'),'breeding parents and lineage parents must be protected from destructive flows');
assert.ok(css.includes('.breeding-modal')&&css.includes('.life-reveal')&&css.includes('.life-stage-dock'));

assert.ok(profile.includes('function familyTreeHtml(')&&profile.includes('function familyNode('));
assert.ok(profile.includes('function geneticsSummary(')&&profile.includes('FAMILY TREE'));
assert.ok(profile.includes("p?.lifeStage==='egg'")&&profile.includes("p?.lifeStage==='chick'"));
assert.ok(profileCss.includes('.v730-family')&&profileCss.includes('.v730-genetics'));

assert.ok(arena.includes("life_stage")&&arena.includes("卵・雛はまだ対戦できません"));
assert.ok(arena.includes("mofumori_breeding_jobs")&&arena.includes("この文鳥は交配中です"));

for(const name of ['mofumori_breeding_jobs','mofumori_lifecycle_events','mofumori_start_breeding','mofumori_finish_breeding','mofumori_advance_lifecycle'])assert.ok(sql.includes(name),name+' missing from migration');
assert.ok(sql.includes("life_stage in ('egg','chick','adult')"));
assert.ok(sql.includes("raise exception 'close_relation'"));
assert.ok(sql.includes('180+floor(random()*1261)'),'breeding duration must be 3-24h');
assert.ok(sql.includes('120+floor(random()*481)'),'egg hatch duration must be 2-10h');
assert.ok(sql.includes("growth_points>=6"),'chick growth gate missing');
assert.ok(sql.includes('enable row level security'));
assert.ok(sql.includes('to service_role'));
assert.ok(sql.includes('child.father_id=p.id or child.mother_id=p.id'),'lineage parent fusion protection missing');

console.log('v7.3.0 breeding genetics: multigeneration inheritance, eggs, chicks, family tree and server guards OK');
