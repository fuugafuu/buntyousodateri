const assert=require('node:assert/strict');
const fs=require('node:fs');
const {calculate,validateSubmission}=require('../server/arena-rules.cjs');

const stats={
  appetite:62,frame:50,metabolism:54,temperament:58,curiosity:60,sociability:55,
  endurance:64,agility:68,flightPower:65,focus:70,beakSpeed:66,balance:63,
  weightG:24.4,idealWeightG:24.5,fitness:67
};
function rejects(game,raw,elapsedMs=40000){
  let threw=false;
  try{validateSubmission(game,raw,{elapsedMs});}catch(e){threw=true;assert.ok(e.status>=400&&e.status<500);}
  assert.ok(threw,game+' malformed submission must be rejected');
}

const valid={
  flight:{durationMs:30000,height:12000,collisions:3},
  kale:{durationMs:10000,taps:92},
  perch:{hits:9,misses:3,avgReactionMs:390},
  seedrace:{durationMs:15000,count:88},
  ring:{durationMs:20000,hits:12,misses:4,avgReactionMs:210}
};
for(const [game,raw] of Object.entries(valid)){
  const elapsed=game==='kale'?10000:game==='seedrace'?15000:game==='ring'?20000:game==='perch'?9000:30000;
  assert.equal(validateSubmission(game,raw,{elapsedMs:elapsed}),true);
  const out=calculate(game,raw,stats);
  assert.ok(Number.isFinite(out.score)&&out.score>=0,game+' score must be finite');
}

rejects('seedrace',{durationMs:15000,count:999999},15000);
rejects('seedrace',{durationMs:1,count:1},10);
rejects('ring',{durationMs:20000,hits:16,misses:16,avgReactionMs:100},20000);
rejects('ring',{durationMs:20000,hits:16,misses:0,avgReactionMs:Infinity},20000);
rejects('ring',{durationMs:20000,hits:16,misses:0,avgReactionMs:100},100);

for(let i=0;i<2000;i++){
  const games=['flight','kale','perch','seedrace','ring'];
  const game=games[i%games.length];
  const raw={
    durationMs:(Math.random()-.15)*100000,
    height:(Math.random()-.2)*100000,
    collisions:Math.floor((Math.random()-.2)*120),
    taps:Math.floor((Math.random()-.2)*1200),
    count:Math.floor((Math.random()-.2)*1000),
    hits:Math.floor((Math.random()-.2)*80),
    misses:Math.floor((Math.random()-.2)*80),
    avgReactionMs:(Math.random()-.2)*6000
  };
  try{
    validateSubmission(game,raw,{elapsedMs:50000});
    const out=calculate(game,raw,stats);
    assert.ok(Number.isFinite(out.score)&&out.score>=0);
  }catch(e){assert.ok(e.status>=400&&e.status<500);}
}

const html=fs.readFileSync('index.html','utf8');
const ui=fs.readFileSync('v6-ui.js','utf8');
const pet=fs.readFileSync('pet-system.js','utf8');
const css=fs.readFileSync('v7-ui.css','utf8');
const migration=fs.readFileSync('supabase/mofumori_v7_2_arena_ready_bots.sql','utf8');
const isolation=fs.readFileSync('supabase/mofumori_v7_2_bot_isolation.sql','utf8');

assert.ok(html.includes('id="birdModal"')&&html.includes('id="gachaModal"'),'collection and gacha must be separate modals');
assert.ok(html.includes('id="petSortSelect"'),'companion sorting selector missing');
assert.ok(ui.includes("A.petId=equipped.id"),'equipped pet must be selected when arena opens');
assert.ok(ui.includes("mofumoriArenaTutorialV72"),'first-time arena tutorial missing');
assert.ok(ui.includes("arena('handshake'"),'secure ready handshake missing');
assert.ok(ui.includes('v72-rival-bird'),'opponent must be visible in games');
assert.ok(ui.includes("seedrace")&&ui.includes("ring"),'new online games missing');
assert.ok(pet.includes("const DEV_MODE=['localhost'"),'debug mode must be local-development scoped');
assert.ok(pet.includes("DEBUG_FRIEND_CODE='MF-DEBUGBIRD'"),'debug friend hook missing');
assert.ok(pet.includes("if(!DEV_MODE)return"),'debug editor must refuse production use');
assert.match(migration,/generate_series\(1,50\)/,'CPU pool must contain 50 entries');
assert.ok(migration.includes("waited<10000"),'CPU fallback must wait 10 seconds');
assert.ok(migration.includes("user_key not like 'bot:arena:%'"),'human matchmaking must exclude CPU queue identities');
assert.ok(isolation.includes("where p.user_key not like 'bot:arena:%'"),'CPU profiles must be excluded from leaderboards');
assert.ok(css.includes('v72-connection-check')&&css.includes('v72-race-track'),'v7.2 arena visuals missing');

console.log('v7.2 online arena: split collection UI, secure ready flow, five games, CPU fallback and adversarial guards OK');
