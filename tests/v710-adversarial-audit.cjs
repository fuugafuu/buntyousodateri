const assert=require('node:assert/strict');
const fs=require('node:fs');
const {calculate,validateSubmission}=require('../server/arena-rules.cjs');

const stats={
  appetite:55,frame:50,metabolism:50,temperament:55,curiosity:50,sociability:50,
  endurance:60,agility:62,flightPower:58,focus:61,beakSpeed:59,balance:57,
  weightG:24.5,idealWeightG:24.5,fitness:60
};
function throws(fn,label){
  let ok=false;
  try{fn()}catch(e){ok=true;assert.ok(Number(e.status)>=400, label+' should expose a safe client error');}
  assert.ok(ok,label+' should be rejected');
}

// Valid online results.
assert.equal(validateSubmission('flight',{durationMs:30000,height:9000,collisions:2},{elapsedMs:30000}),true);
assert.equal(validateSubmission('kale',{durationMs:10000,taps:80},{elapsedMs:10000}),true);
assert.equal(validateSubmission('perch',{hits:9,misses:3,avgReactionMs:420},{elapsedMs:8000}),true);
for(const [game,raw] of [
  ['flight',{durationMs:30000,height:9000,collisions:2}],
  ['kale',{durationMs:10000,taps:80}],
  ['perch',{hits:9,misses:3,avgReactionMs:420}]
]){
  const result=calculate(game,raw,stats);
  assert.ok(Number.isFinite(result.score)&&result.score>=0,game+' score must be finite and non-negative');
}

// Deliberately abnormal / tampered submissions.
throws(()=>validateSubmission('flight',{durationMs:1,height:999999999,collisions:-4},{elapsedMs:10}),'early flight');
throws(()=>validateSubmission('flight',{durationMs:30000,height:Infinity,collisions:0},{elapsedMs:30000}),'infinite flight height');
throws(()=>validateSubmission('kale',{durationMs:10000,taps:1000000},{elapsedMs:10000}),'impossible tap count');
throws(()=>validateSubmission('kale',{durationMs:10000,taps:NaN},{elapsedMs:10000}),'NaN tap count');
throws(()=>validateSubmission('perch',{hits:12,misses:12,avgReactionMs:50},{elapsedMs:5000}),'too many perch rounds');
throws(()=>validateSubmission('perch',{hits:12,misses:0,avgReactionMs:1},{elapsedMs:5000}),'impossible reaction time');
throws(()=>validateSubmission('perch',{hits:12,misses:0,avgReactionMs:100},{elapsedMs:50}),'instant perch completion');
throws(()=>validateSubmission('flight',{durationMs:30000,height:100,collisions:0},{elapsedMs:30000,expired:true}),'expired match');
throws(()=>validateSubmission('unknown',{},{}),'unknown game');

// Fuzz: no accepted result may produce NaN/Infinity.
for(let i=0;i<1500;i++){
  const game=['flight','kale','perch'][i%3];
  const raw={
    durationMs:(Math.random()-.2)*100000,
    height:(Math.random()-.2)*100000,
    collisions:(Math.random()-.2)*200,
    taps:(Math.random()-.2)*1000,
    hits:Math.floor((Math.random()-.2)*40),
    misses:Math.floor((Math.random()-.2)*40),
    avgReactionMs:(Math.random()-.2)*5000
  };
  try{
    validateSubmission(game,raw,{elapsedMs:40000});
    const out=calculate(game,raw,stats);
    assert.ok(Number.isFinite(out.score)&&out.score>=0,'fuzz score must remain finite');
  }catch(e){
    assert.ok(Number(e.status)>=400&&Number(e.status)<500,'fuzz rejection must be a controlled 4xx');
  }
}

// HTML integrity: duplicate ids create very hard-to-debug mobile UI failures.
const html=fs.readFileSync('index.html','utf8');
const ids=[...html.matchAll(/\sid=["']([^"']+)["']/g)].map(m=>m[1]);
const duplicateIds=ids.filter((id,index)=>ids.indexOf(id)!==index);
assert.deepEqual([...new Set(duplicateIds)],[],'index.html contains duplicate ids');

// The local game menu is intentionally curated rather than exposing legacy prototypes.
const main=fs.readFileSync('main.js','utf8');
const gameBlock=main.slice(main.indexOf('const minigames=['),main.indexOf('const shopData'));
const gameIds=[...gameBlock.matchAll(/id:'([^']+)'/g)].map(m=>m[1]);
assert.deepEqual(gameIds,['catch','timing','memory','rhythm','fly','maze']);
assert.ok(!gameBlock.includes("id:'tap'"));
assert.ok(!gameBlock.includes("id:'quiz'"));
assert.ok(!gameBlock.includes("id:'treasure'"));

// Theme/collection regression guards.
const css=fs.readFileSync('v7-ui.css','utf8');
const v7=fs.readFileSync('v7-ui.js','utf8');
assert.ok(css.includes('v7.1 theme consolidation'));
assert.ok(css.includes('body.night.mofumori-v6 #birdModal .pet-card'));
assert.ok(css.includes('body.night.mofumori-v6 .v6-battle'));
assert.ok(v7.includes('data-v7-collection-tab="pets"'));
assert.ok(v7.includes('data-v7-collection-tab="gacha"'));

console.log('v7.1 adversarial audit: malformed online results, fuzzing, DOM integrity, curated local games and night-theme guards OK');
